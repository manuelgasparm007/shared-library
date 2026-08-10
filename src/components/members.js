import { store } from '../data/store.js';
import { showToast } from './toast.js';

let searchQuery = '';

export function renderMembers(container) {
  const currentUser = store.getCurrentUser();
  const isLibrarian = currentUser.role === 'librarian';
  const members = store.getMembers();
  const loans = store.getLoans();

  const filteredMembers = members.filter(m => {
    return searchQuery === '' ||
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone && m.phone.toLowerCase().includes(searchQuery.toLowerCase()));
  }).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));

  const membersHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      <div>
        <h2 style="font-size:1.8rem;">Directório de Leitores & Membros</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">Gestão de utilizadores inscritos na biblioteca (${filteredMembers.length} registados)</p>
      </div>

      ${isLibrarian ? `<button id="btn-add-member-modal" class="btn btn-primary">➕ Registar Novo Leitor</button>` : ''}
    </div>

    <!-- Search Bar -->
    <div style="background:var(--bg-card); padding:1rem 1.25rem; border-radius:var(--radius-lg); border:1px solid var(--border-glass);">
      <div class="form-group" style="margin:0;">
        <input type="text" id="member-search-input" placeholder="🔍 Pesquisar leitor por nome, email ou telefone..." value="${searchQuery}">
      </div>
    </div>

    <!-- Members Table -->
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>ID Membro</th>
            <th>Nome Completo</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Data de Inscrição</th>
            <th>Recomendações / Empréstimos</th>
            ${isLibrarian ? `<th style="text-align:right;">Acções</th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${filteredMembers.length === 0 ? '<tr><td colspan="7" style="text-align:center; color:var(--text-dim);">Nenhum leitor encontrado</td></tr>' : ''}
          ${filteredMembers.map(member => {
            const memberActiveLoans = loans.filter(l => l.memberName === member.fullName && l.status === 'Emprestado');
            const isPending = member.status === 'pending';
            return `
              <tr>
                <td><strong>${member.id}</strong></td>
                <td>
                  <div style="display:flex; align-items:center; gap:0.75rem;">
                    <div style="width:32px; height:32px; border-radius:var(--radius-full); background:linear-gradient(135deg, var(--accent-primary), #818cf8); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem;">
                      ${member.fullName.charAt(0)}
                    </div>
                    <div>
                      <strong>${member.fullName}</strong>
                      ${member.role === 'librarian' ? `<span style="font-size:0.7rem; margin-left:0.4rem; background:rgba(99, 102, 241, 0.2); color:#818cf8; padding:0.15rem 0.4rem; border-radius:var(--radius-sm);">Bibliotecário</span>` : ''}
                      ${isPending ? `<span style="font-size:0.7rem; margin-left:0.4rem; background:rgba(239, 68, 68, 0.2); color:#ef4444; padding:0.15rem 0.4rem; border-radius:var(--radius-sm);">Aguarda Aprovação</span>` : ''}
                    </div>
                  </div>
                </td>
                <td>${member.email}</td>
                <td>${member.phone || 'N/A'}</td>
                <td>${member.joinedDate}</td>
                <td>
                  <span class="status-tag ${isPending ? 'overdue' : (memberActiveLoans.length > 0 ? 'borrowed' : 'available')}">
                    ${isPending ? '⏳ Conta Pendente' : `${memberActiveLoans.length} empréstimo(s)`}
                  </span>
                </td>
                ${isLibrarian ? `
                  <td style="text-align:right;">
                    <div class="action-buttons-group">
                      ${isPending ? `
                        <button class="btn btn-secondary btn-sm btn-approve-member" data-id="${member.id}" style="background:rgba(16, 185, 129, 0.2); color:#10b981; border-color:rgba(16, 185, 129, 0.4);" title="Aprovar Conta de Leitor">✅ Aprovar</button>
                      ` : ''}
                      <button class="btn btn-secondary btn-sm btn-edit-member" data-id="${member.id}" title="Editar Leitor">✏️</button>
                      <button class="btn btn-danger btn-sm btn-delete-member" data-id="${member.id}" title="Eliminar Leitor">🗑️</button>
                    </div>
                  </td>
                ` : ''}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div id="member-modal-portal"></div>
  `;

  container.innerHTML = membersHtml;

  const searchInput = document.getElementById('member-search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderMembers(container);
  });

  if (isLibrarian) {
    const addBtn = document.getElementById('btn-add-member-modal');
    if (addBtn) {
      addBtn.addEventListener('click', () => openMemberModal(null, () => renderMembers(container)));
    }

    container.querySelectorAll('.btn-approve-member').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        store.approveMember(id);
        showToast('Conta de leitor aprovada com sucesso!', 'success');
        renderMembers(container);
      });
    });

    container.querySelectorAll('.btn-edit-member').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const member = store.getMembers().find(m => m.id === id);
        openMemberModal(member, () => renderMembers(container));
      });
    });

    container.querySelectorAll('.btn-delete-member').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Tem a certeza que deseja eliminar este membro?')) {
          store.deleteMember(id);
          showToast('Membro eliminado com sucesso', 'success');
          renderMembers(container);
        }
      });
    });
  }
}

function openMemberModal(member, onSave) {
  const portal = document.getElementById('member-modal-portal');
  const isEdit = !!member;

  portal.innerHTML = `
    <div class="modal-backdrop-overlay" id="backdrop-member-modal"></div>
    <dialog id="modal-member-form" class="custom-modal" open>
      <div class="modal-header">
        <h3>${isEdit ? '✏️ Editar Leitor' : '➕ Registar Novo Leitor'}</h3>
        <button id="btn-close-member-modal" class="btn btn-secondary btn-sm" style="border:none;">✕</button>
      </div>

      <form id="form-member" class="modal-body">
        <div class="form-group">
          <label>Nome Completo *</label>
          <input type="text" id="member-fullname" required value="${member ? member.fullName : ''}">
        </div>

        <div class="form-group">
          <label>Endereço de Email *</label>
          <input type="email" id="member-email" required value="${member ? member.email : ''}">
        </div>

        <div class="form-group">
          <label>Número de Telefone</label>
          <input type="tel" id="member-phone" value="${member ? (member.phone || '') : ''}" placeholder="+351 910 000 000">
        </div>

        <div class="form-group">
          <label>Função / Perfil</label>
          <select id="member-role">
            <option value="patron" ${member && member.role === 'patron' ? 'selected' : ''}>Leitor / Membro</option>
            <option value="librarian" ${member && member.role === 'librarian' ? 'selected' : ''}>Bibliotecário / Administrador</option>
          </select>
        </div>
      </form>

      <div class="modal-footer">
        <button id="btn-cancel-member" class="btn btn-secondary">Cancelar</button>
        <button id="btn-save-member" class="btn btn-primary">${isEdit ? 'Guardar Alterações' : 'Registar Leitor'}</button>
      </div>
    </dialog>
  `;

  const closeModal = () => portal.innerHTML = '';

  document.getElementById('btn-close-member-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-member').addEventListener('click', closeModal);
  document.getElementById('backdrop-member-modal').addEventListener('click', closeModal);

  document.getElementById('btn-save-member').addEventListener('click', () => {
    const fullName = document.getElementById('member-fullname').value.trim();
    const email = document.getElementById('member-email').value.trim();

    if (!fullName || !email) {
      showToast('Nome e Email são obrigatórios', 'error');
      return;
    }

    const memberData = {
      fullName,
      email,
      phone: document.getElementById('member-phone').value,
      role: document.getElementById('member-role').value
    };

    if (isEdit) {
      store.updateMember(member.id, memberData);
      showToast('Dados do leitor actualizados!', 'success');
    } else {
      store.addMember(memberData);
      showToast('Novo leitor registado com sucesso!', 'success');
    }

    closeModal();
    if (onSave) onSave();
  });
}

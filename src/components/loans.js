import { store } from '../data/store.js';
import { showToast } from './toast.js';

let filterStatus = 'ACTIVE'; // 'ACTIVE', 'RETURNED', 'OVERDUE', 'ALL'

export function renderLoans(container) {
  const currentUser = store.getCurrentUser();
  const isLibrarian = currentUser.role === 'librarian';
  const allLoans = store.getLoans();

  // Scope loans to user if patron
  const userLoans = isLibrarian 
    ? allLoans 
    : allLoans.filter(l => 
        (l.memberName && l.memberName.toLowerCase() === currentUser.name.toLowerCase()) || 
        (l.memberEmail && l.memberEmail.toLowerCase() === currentUser.email.toLowerCase())
      );

  const filteredLoans = userLoans.filter(loan => {
    if (filterStatus === 'ACTIVE') return loan.status === 'Emprestado';
    if (filterStatus === 'RETURNED') return loan.status === 'Devolvido';
    if (filterStatus === 'OVERDUE') return loan.isOverdue && loan.status === 'Emprestado';
    return true;
  });

  const loansHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      <div>
        <h2 style="font-size:1.8rem;">${isLibrarian ? 'Gestão de Empréstimos & Devoluções' : 'Os Meus Empréstimos'}</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">${isLibrarian ? 'Controlo de prazos, devoluções e renovações de livros' : 'Histórico e estado das suas requisições de livros'}</p>
      </div>

      ${isLibrarian ? `<button id="btn-checkout-modal" class="btn btn-primary">📖 Registar Empréstimo</button>` : ''}
    </div>

    <!-- Filter Buttons -->
    <div style="display:flex; gap:0.5rem; background:var(--bg-card); padding:0.5rem; border-radius:var(--radius-lg); border:1px solid var(--border-glass); flex-wrap:wrap;">
      <button class="btn btn-sm ${filterStatus === 'ACTIVE' ? 'btn-primary' : 'btn-secondary'}" data-filter="ACTIVE">Activos (${userLoans.filter(l => l.status === 'Emprestado').length})</button>
      <button class="btn btn-sm ${filterStatus === 'OVERDUE' ? 'btn-primary' : 'btn-secondary'}" data-filter="OVERDUE">Em Atraso (${userLoans.filter(l => l.isOverdue).length})</button>
      <button class="btn btn-sm ${filterStatus === 'RETURNED' ? 'btn-primary' : 'btn-secondary'}" data-filter="RETURNED">Devolvidos (${userLoans.filter(l => l.status === 'Devolvido').length})</button>
      <button class="btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}" data-filter="ALL">Todos (${userLoans.length})</button>
    </div>

    <!-- Loans Table -->
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>ID Transação</th>
            <th>Livro</th>
            <th>Requisitante</th>
            <th>Data Empréstimo</th>
            <th>Data Limite</th>
            <th>Data Devolução</th>
            <th>Estado</th>
            ${isLibrarian ? `<th style="text-align:right;">Acções</th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${filteredLoans.length === 0 ? '<tr><td colspan="8" style="text-align:center; color:var(--text-dim);">Nenhum empréstimo registado nesta vista</td></tr>' : ''}
          ${filteredLoans.map(loan => {
            const book = store.getBookById(loan.bookId);
            const statusClass = loan.status === 'Devolvido' ? 'returned' : (loan.isOverdue ? 'overdue' : 'borrowed');
            const statusLabel = loan.status === 'Devolvido' ? 'Devolvido' : (loan.isOverdue ? 'Em Atraso' : 'Emprestado');

            return `
              <tr>
                <td><strong>${loan.id}</strong></td>
                <td>
                  <strong>${book ? book.title : loan.bookId}</strong>
                  <div style="font-size:0.75rem; color:var(--text-dim);">ID: ${loan.bookId}</div>
                </td>
                <td>
                  <div>${loan.memberName}</div>
                  ${loan.memberEmail ? `<div style="font-size:0.75rem; color:var(--text-dim);">${loan.memberEmail}</div>` : ''}
                </td>
                <td>${loan.checkoutDate}</td>
                <td><strong style="${loan.isOverdue ? 'color:var(--accent-danger);' : ''}">${loan.dueDate}</strong></td>
                <td>${loan.returnDate || '-'}</td>
                <td><span class="status-tag ${statusClass}">${statusLabel}</span></td>
                ${isLibrarian ? `
                  <td style="text-align:right;">
                    ${loan.status === 'Emprestado' ? `
                      <button class="btn btn-secondary btn-sm btn-renew-loan" data-id="${loan.id}" title="Renovar +14 Dias">⏳ Renovar</button>
                      <button class="btn btn-primary btn-sm btn-return-loan" data-id="${loan.id}">↩️ Devolver</button>
                    ` : '<span style="color:var(--text-dim); font-size:0.8rem;">Concluído</span>'}
                  </td>
                ` : ''}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div id="loan-modal-portal"></div>
  `;

  container.innerHTML = loansHtml;

  // Filter Bindings
  container.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterStatus = e.currentTarget.dataset.filter;
      renderLoans(container);
    });
  });

  if (isLibrarian) {
    const btnCheckout = document.getElementById('btn-checkout-modal');
    if (btnCheckout) {
      btnCheckout.addEventListener('click', () => openCheckoutModal(() => renderLoans(container)));
    }

    container.querySelectorAll('.btn-return-loan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Confirmar a devolução deste livro ao acervo?')) {
          store.returnBook(id);
          showToast('Livro devolvido e estado actualizado para Disponível', 'success');
          renderLoans(container);
        }
      });
    });

    container.querySelectorAll('.btn-renew-loan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        store.renewLoan(id, 14);
        showToast('Prazo de empréstimo renovado por +14 dias', 'success');
        renderLoans(container);
      });
    });
  }
}

function openCheckoutModal(onSave) {
  const portal = document.getElementById('loan-modal-portal');
  const books = store.getBooks().filter(b => b.status === 'Disponível');
  const members = store.getMembers();

  if (books.length === 0) {
    showToast('Nenhum livro disponível no momento para empréstimo', 'error');
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  portal.innerHTML = `
    <div class="modal-backdrop-overlay" id="backdrop-checkout-modal"></div>
    <dialog id="modal-checkout-form" class="custom-modal" open>
      <div class="modal-header">
        <h3>📖 Novo Empréstimo de Livro</h3>
        <button id="btn-close-checkout-modal" class="btn btn-secondary btn-sm" style="border:none;">✕</button>
      </div>

      <form id="form-checkout" class="modal-body">
        <div class="form-group">
          <label>Seleccionar Livro Disponível *</label>
          <select id="checkout-book-id" required>
            ${books.map(b => `<option value="${b.id}">${b.title} (${b.author}) - [${b.id}]</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Seleccionar Leitor / Requisitante *</label>
          <select id="checkout-member-name" required>
            ${members.map(m => `<option value="${m.fullName}" data-email="${m.email}">${m.fullName} (${m.email})</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Duração do Empréstimo (Presets)</label>
          <div style="display:flex; gap:0.5rem;" id="duration-preset-group">
            <button type="button" class="btn btn-secondary btn-sm preset-btn" data-days="7">7 Dias</button>
            <button type="button" class="btn btn-primary btn-sm preset-btn" data-days="14">14 Dias (Padrão)</button>
            <button type="button" class="btn btn-secondary btn-sm preset-btn" data-days="21">21 Dias</button>
            <button type="button" class="btn btn-secondary btn-sm preset-btn" data-days="30">30 Dias</button>
          </div>
        </div>

        <div class="form-group">
          <label>Ou Definir Data Limite Personalizada</label>
          <input type="date" id="checkout-custom-date" min="${todayStr}">
        </div>
      </form>

      <div class="modal-footer">
        <button id="btn-cancel-checkout" class="btn btn-secondary">Cancelar</button>
        <button id="btn-save-checkout" class="btn btn-primary">Confirmar Empréstimo</button>
      </div>
    </dialog>
  `;

  let selectedDays = 14;

  const closeModal = () => portal.innerHTML = '';

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.preset-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      e.currentTarget.classList.remove('btn-secondary');
      e.currentTarget.classList.add('btn-primary');
      selectedDays = parseInt(e.currentTarget.dataset.days);
      document.getElementById('checkout-custom-date').value = '';
    });
  });

  document.getElementById('btn-close-checkout-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-checkout').addEventListener('click', closeModal);
  document.getElementById('backdrop-checkout-modal').addEventListener('click', closeModal);

  document.getElementById('btn-save-checkout').addEventListener('click', () => {
    const bookId = document.getElementById('checkout-book-id').value;
    const memberSelect = document.getElementById('checkout-member-name');
    const memberName = memberSelect.value;
    const memberEmail = memberSelect.options[memberSelect.selectedIndex].dataset.email;
    const customDate = document.getElementById('checkout-custom-date').value;

    try {
      store.checkoutBook({
        bookId,
        memberName,
        memberEmail,
        dueDays: selectedDays,
        customDueDate: customDate || null
      });

      showToast('Empréstimo registado com sucesso!', 'success');
      closeModal();
      if (onSave) onSave();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

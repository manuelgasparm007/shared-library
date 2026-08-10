import { store } from '../data/store.js';
import { showToast } from './toast.js';

export function renderAuthModal(container, onSuccess) {
  const modalHtml = `
    <div class="modal-backdrop-overlay" id="backdrop-auth-modal"></div>
    <dialog id="auth-modal" class="custom-modal" open>
      <div class="modal-header">
        <h3 id="auth-modal-title">🌿 Sessão - Biblioteca Camomila</h3>
      </div>
      <form id="auth-form" class="modal-body">
        <div class="form-group">
          <label>Perfil de Acesso</label>
          <select id="auth-role" class="form-control">
            <option value="librarian">Bibliotecário / Administrador</option>
            <option value="patron" selected>Leitor / Membro</option>
          </select>
        </div>

        <div class="form-group">
          <label>Endereço de Email</label>
          <input type="email" id="auth-email" placeholder="exemplo@bibliotecacamomila.pt" required value="manuelgasparm@gmail.com">
        </div>

        <div class="form-group" id="name-group" style="display: none;">
          <label>Nome Completo</label>
          <input type="text" id="auth-name" placeholder="O seu nome completo">
        </div>

        <div class="form-group">
          <label>Palavra-passe (Demo)</label>
          <input type="password" id="auth-password" value="123456" placeholder="••••••••">
        </div>
      </form>
      <div class="modal-footer">
        <button type="button" id="btn-auth-submit" class="btn btn-primary" style="width:100%;">Entrar na Aplicação</button>
      </div>
    </dialog>
  `;

  container.innerHTML = modalHtml;

  const roleSelect = document.getElementById('auth-role');
  const emailInput = document.getElementById('auth-email');
  const nameGroup = document.getElementById('name-group');

  roleSelect.addEventListener('change', (e) => {
    if (e.target.value === 'librarian') {
      emailInput.value = 'admin@biblioteca.pt';
      nameGroup.style.display = 'none';
    } else {
      emailInput.value = 'manuelgasparm@gmail.com';
      nameGroup.style.display = 'none';
    }
  });

  document.getElementById('btn-auth-submit').addEventListener('click', () => {
    const role = roleSelect.value;
    const email = emailInput.value.trim();
    const name = document.getElementById('auth-name').value.trim();

    if (!email) {
      showToast('Por favor insira o seu email', 'error');
      return;
    }

    const user = store.login(email, role, name);
    showToast(`Bem-vindo, ${user.name}!`, 'success');
    if (onSuccess) onSuccess(user);
  });
}

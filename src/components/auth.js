import { store } from '../data/store.js';
import { showToast } from './toast.js';

export function renderLandingAuth(container, onSuccess) {
  const landingHtml = `
    <div class="landing-page-overlay">
      <div class="landing-card">
        <div class="landing-header">
          <div class="landing-logo-icon">
            <img src="./favicon.png" alt="Biblioteca Camomila Logo" style="width: 34px; height: 34px; object-fit: contain;">
          </div>
          <h2>Biblioteca Camomila</h2>
          <p>Sistema de Gestão da Biblioteca</p>
        </div>

        <!-- Mode Switcher Tabs -->
        <div class="auth-tabs" style="display:flex; background:var(--bg-glass); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:4px; gap:4px;">
          <button type="button" id="tab-login" class="auth-tab-btn active" style="flex:1; padding:0.55rem; border:none; border-radius:var(--radius-sm); font-weight:600; cursor:pointer; background:var(--accent-primary); color:#fff; transition:all 0.2s;">🔑 Iniciar Sessão</button>
          <button type="button" id="tab-register" class="auth-tab-btn" style="flex:1; padding:0.55rem; border:none; border-radius:var(--radius-sm); font-weight:600; cursor:pointer; background:transparent; color:var(--text-muted); transition:all 0.2s;">✨ Criar Conta</button>
        </div>

        <!-- Login Form -->
        <form id="form-login" class="landing-form">
          <div id="login-error-banner" style="display:none; padding:0.75rem; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.4); color:#ef4444; border-radius:var(--radius-md); font-size:0.85rem; font-weight:600;"></div>

          <div class="form-group">
            <label>Endereço de Email *</label>
            <input type="email" id="login-email" placeholder="seu.email@exemplo.pt" required value="admin@camomila.pt" autocapitalize="none" autocorrect="off" spellcheck="false" autocomplete="email">
          </div>

          <div class="form-group">
            <label>Palavra-passe (Demo) *</label>
            <input type="password" id="login-password" value="123456" placeholder="••••••••" required>
          </div>

          <button type="submit" class="btn btn-primary btn-landing">Entrar na Biblioteca</button>
        </form>

        <!-- Registration Form -->
        <form id="form-register" class="landing-form" style="display:none;">
          <div id="reg-error-banner" style="display:none; padding:0.75rem; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.4); color:#ef4444; border-radius:var(--radius-md); font-size:0.85rem; font-weight:600;"></div>

          <div class="form-group">
            <label>Nome Completo *</label>
            <input type="text" id="reg-name" placeholder="Ex: Maria Santos" required>
          </div>

          <div class="form-group">
            <label>Endereço de Email *</label>
            <input type="email" id="reg-email" placeholder="maria.santos@exemplo.pt" required>
          </div>

          <div class="form-group">
            <label>Número de Telefone</label>
            <input type="tel" id="reg-phone" placeholder="+351 912 345 678">
          </div>

          <div class="form-group">
            <label>Palavra-passe *</label>
            <input type="password" id="reg-password" value="123456" placeholder="••••••••" required>
          </div>

          <div style="font-size:0.78rem; color:var(--text-muted); background:var(--bg-glass); padding:0.65rem; border-radius:var(--radius-sm); border:1px solid var(--border-glass);">
            ℹ️ As novas contas são criadas com permissões de <strong>Leitor</strong> e requerem aprovação prévia pelo Bibliotecário.
          </div>

          <button type="submit" class="btn btn-primary btn-landing">Registar Conta de Leitor</button>
        </form>

        <!-- Demo Credentials Hints -->
        <div class="landing-demo-hints" id="demo-hints-box">
          <div style="font-weight:700; font-size:0.8rem; color:var(--text-muted); margin-bottom:0.4rem;">💡 Contas de Demonstração (Clique para preencher):</div>
          <div class="demo-chip" id="demo-admin">
            <span>👑 Admin / Bibliotecário:</span> <code>admin@camomila.pt</code>
          </div>
          <div class="demo-chip" id="demo-patron">
            <span>👤 Leitor / Membro:</span> <code>manuelgasparm@gmail.com</code>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = landingHtml;

  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const demoBox = document.getElementById('demo-hints-box');
  const loginEmail = document.getElementById('login-email');

  // Tab Switcher
  tabLogin.addEventListener('click', () => {
    tabLogin.style.background = 'var(--accent-primary)';
    tabLogin.style.color = '#fff';
    tabRegister.style.background = 'transparent';
    tabRegister.style.color = 'var(--text-muted)';
    formLogin.style.display = 'flex';
    formRegister.style.display = 'none';
    demoBox.style.display = 'flex';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.style.background = 'var(--accent-primary)';
    tabRegister.style.color = '#fff';
    tabLogin.style.background = 'transparent';
    tabLogin.style.color = 'var(--text-muted)';
    formRegister.style.display = 'flex';
    formLogin.style.display = 'none';
    demoBox.style.display = 'none';
  });

  // Demo Credentials
  document.getElementById('demo-admin').addEventListener('click', () => {
    loginEmail.value = 'admin@camomila.pt';
  });

  document.getElementById('demo-patron').addEventListener('click', () => {
    loginEmail.value = 'manuelgasparm@gmail.com';
  });

  // Login Form Submission
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = document.getElementById('login-password').value;
    const loginErrorBanner = document.getElementById('login-error-banner');

    if (loginErrorBanner) loginErrorBanner.style.display = 'none';

    try {
      const user = store.login(email, password);
      showToast(`Bem-vindo, ${user.name}!`, 'success');
      if (onSuccess) onSuccess(user);
    } catch (err) {
      if (loginErrorBanner) {
        loginErrorBanner.innerHTML = `⚠️ <strong>Erro de Login:</strong> ${err.message}`;
        loginErrorBanner.style.display = 'block';
      }
      showToast(`Erro ao entrar: ${err.message}`, 'error');
    }
  });

  // Registration Form Submission
  formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const regErrorBanner = document.getElementById('reg-error-banner');

    if (regErrorBanner) regErrorBanner.style.display = 'none';

    try {
      store.registerNewUser({ fullName, email, phone, password });
      showToast('Conta registada com sucesso! O seu pedido de leitor aguarda aprovação pelo Bibliotecário.', 'success');

      // Switch to login tab and prefill email and password
      loginEmail.value = email;
      document.getElementById('login-password').value = password;
      tabLogin.click();
    } catch (err) {
      if (regErrorBanner) {
        regErrorBanner.innerHTML = `⚠️ <strong>Erro de Registo:</strong> ${err.message}`;
        regErrorBanner.style.display = 'block';
      }
      showToast(`Erro ao registar: ${err.message}`, 'error');
    }
  });
}

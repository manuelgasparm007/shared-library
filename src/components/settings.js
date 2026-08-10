import { store } from '../data/store.js';
import { showToast } from './toast.js';

let logSearchQuery = '';
let logFilterType = 'ALL';

export function renderSettings(container) {
  const currentUser = store.getCurrentUser();
  const isLibrarian = currentUser.role === 'librarian';
  const cloudConfig = store.getCloudConfig();
  const isCloudActive = !!(cloudConfig.url && cloudConfig.key);
  const currentTheme = localStorage.getItem('library_theme') || 'parchment';

  const toastLogs = store.getToastLogs();
  const filteredLogs = toastLogs.filter(log => {
    const matchesSearch = logSearchQuery === '' || 
      log.message.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesType = logFilterType === 'ALL' || log.type === logFilterType;
    return matchesSearch && matchesType;
  });

  const settingsHtml = `
    <div>
      <h2 style="font-size:1.8rem;">Definições</h2>
      <p style="color:var(--text-muted); font-size:0.9rem;">${isLibrarian ? 'Gestão da base de dados, aparências visuais, exportação, sincronização cloud e auditoria' : 'Personalização de temas visuais e estilo da aplicação'}</p>
    </div>

    <!-- Cards Grid -->
    <div style="display:grid; grid-template-columns: ${isLibrarian ? '1fr 1fr' : '1fr'}; gap:1.5rem;">
      <!-- Theme Customization Card (All Users) -->
      <div style="grid-column: 1 / -1; background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3>🎨 Tema Visual & Estilo Estético</h3>
        <p style="color:var(--text-muted); font-size:0.88rem;">Personalize a paleta de cores e o estilo da interface da aplicação. O tema escolhido é guardado automaticamente.</p>

        <div class="form-group" style="max-width: 420px; margin:0;">
          <label>Tema Ativo da Aplicação</label>
          <select id="settings-theme-selector">
            <option value="parchment" ${currentTheme === 'parchment' ? 'selected' : ''}>📜 Pergaminho (Sépia - Defeito)</option>
            <option value="camomila" ${currentTheme === 'camomila' ? 'selected' : ''}>🌿 Camomila (Verde Nature)</option>
            <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>🌙 Escuro (Midnight Glass)</option>
            <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>☀️ Claro (Nórdico Alabastro)</option>
            <option value="violet" ${currentTheme === 'violet' ? 'selected' : ''}>💜 Violeta (Cyber Violet)</option>
          </select>
        </div>
      </div>

      <!-- Password Reset Card (All Users) -->
      <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3>🔒 Alterar Palavra-Passe</h3>
        <p style="color:var(--text-muted); font-size:0.88rem;">Atualize a sua palavra-passe de acesso à conta da biblioteca.</p>

        <form id="form-change-password" style="display:flex; flex-direction:column; gap:1rem;">
          <div class="form-group" style="margin:0;">
            <label>Nova Palavra-passe *</label>
            <input type="password" id="new-password" placeholder="••••••••" required minlength="4">
          </div>
          <div class="form-group" style="margin:0;">
            <label>Confirmar Nova Palavra-passe *</label>
            <input type="password" id="confirm-password" placeholder="••••••••" required minlength="4">
          </div>
          <button type="submit" class="btn btn-primary btn-sm" style="align-self:flex-start;">Guardar Palavra-Passe</button>
        </form>
      </div>

      ${isLibrarian ? `
        <!-- Backup & Data Management Card (Admin Only) -->
        <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; gap:1.25rem;">
          <h3>💾 Cópias de Segurança (Backup JSON)</h3>
          <p style="color:var(--text-muted); font-size:0.88rem;">Guarde um instantâneo completo de todos os livros, leitores e histórico de empréstimos em ficheiro JSON, ou restaure dados guardados anteriormente.</p>

          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <button id="btn-export-backup" class="btn btn-primary">📥 Exportar Cópia de Segurança (JSON)</button>
            
            <div style="position:relative;">
              <input type="file" id="import-file-input" accept=".json" style="display:none;">
              <button id="btn-trigger-import" class="btn btn-secondary" style="width:100%;">📤 Importar Ficheiro de Cópia (JSON)</button>
            </div>
            
            <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-glass);">
              <button id="btn-reset-seed" class="btn btn-danger btn-sm" style="width:100%;">🔄 Repor Dados Iniciais do Excel (Reset)</button>
            </div>
          </div>
        </div>

        <!-- Supabase Cloud Sync Card (Admin Only) -->
        <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; gap:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3>🌩️ Sincronização Cloud (Supabase)</h3>
            <span class="status-tag ${isCloudActive ? 'available' : 'borrowed'}">
              ${isCloudActive ? '🟢 Ativa' : '⚪ Não Configurada'}
            </span>
          </div>

          <p style="color:var(--text-muted); font-size:0.88rem;">Conecte uma base de dados Supabase para sincronização em tempo real entre computadores e telemóveis.</p>

          <form id="cloud-config-form" style="display:flex; flex-direction:column; gap:1rem;">
            <div class="form-group">
              <label>Supabase Project URL</label>
              <input type="url" id="cloud-url" value="${cloudConfig.url || ''}" placeholder="https://xyzcompany.supabase.co">
            </div>

            <div class="form-group">
              <label>Supabase Anon Key</label>
              <input type="password" id="cloud-key" value="${cloudConfig.key || ''}" placeholder="eyJhbGciOiJIUzI1NiIsInR5...">
            </div>

            <button type="submit" class="btn btn-primary">Guardar Credenciais Cloud</button>
          </form>

          ${isCloudActive ? `
            <div style="display:flex; flex-direction:column; gap:0.5rem; padding-top:0.75rem; border-top:1px solid var(--border-glass);">
              <button id="btn-cloud-push" class="btn btn-secondary btn-sm">⬆️ Enviar Todos os Dados para o Supabase (Push All)</button>
              <button id="btn-cloud-pull" class="btn btn-secondary btn-sm">⬇️ Carregar Dados do Supabase (Pull Remote)</button>
            </div>
          ` : ''}

          <div style="font-size:0.8rem; color:var(--text-dim); background:var(--bg-glass); padding:0.75rem; border-radius:var(--radius-md);">
            ℹ️ <strong>Ficheiro SQL Incluído:</strong> Execute o ficheiro <code style="color:var(--accent-primary);">supabase_schema.sql</code> no Editor SQL do Supabase para criar as tabelas automaticamente.
          </div>
        </div>

        <!-- Toast & Popup Messages Logger Card (Admin Only) -->
        <div style="grid-column: 1 / -1; background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; gap:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
              <h3>📜 Registos de Notificações & Popups (${filteredLogs.length})</h3>
              <p style="color:var(--text-muted); font-size:0.88rem;">Histórico auditável de todas as mensagens popups e eventos apresentados na aplicação.</p>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button id="btn-export-logs" class="btn btn-secondary btn-sm">📥 Exportar Registos (JSON)</button>
              <button id="btn-clear-logs" class="btn btn-danger btn-sm">🧹 Limpar Registos</button>
            </div>
          </div>

          <!-- Log Search & Filter Controls -->
          <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1rem;">
            <div class="form-group" style="margin:0;">
              <input type="text" id="log-search-input" placeholder="🔍 Pesquisar por mensagem ou utilizador..." value="${logSearchQuery}">
            </div>
            <div class="form-group" style="margin:0;">
              <select id="log-type-filter">
                <option value="ALL" ${logFilterType === 'ALL' ? 'selected' : ''}>Todos os Tipos (${toastLogs.length})</option>
                <option value="success" ${logFilterType === 'success' ? 'selected' : ''}>✓ Sucesso (${toastLogs.filter(l => l.type === 'success').length})</option>
                <option value="error" ${logFilterType === 'error' ? 'selected' : ''}>✕ Erro (${toastLogs.filter(l => l.type === 'error').length})</option>
                <option value="info" ${logFilterType === 'info' ? 'selected' : ''}>ℹ️ Informação (${toastLogs.filter(l => l.type === 'info').length})</option>
              </select>
            </div>
          </div>

          <!-- Logs Table -->
          <div class="table-container" style="max-height: 320px; overflow-y: auto;">
            <table class="custom-table" style="font-size:0.85rem;">
              <thead>
                <tr>
                  <th>Data & Hora</th>
                  <th>Tipo</th>
                  <th>Utilizador / Origem</th>
                  <th>Mensagem do Popup</th>
                </tr>
              </thead>
              <tbody>
                ${filteredLogs.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:var(--text-dim);">Nenhum registo de notificação encontrado</td></tr>' : ''}
                ${filteredLogs.map(log => {
                  const badgeClass = log.type === 'success' ? 'available' : (log.type === 'error' ? 'overdue' : 'borrowed');
                  const badgeLabel = log.type === 'success' ? '✓ Sucesso' : (log.type === 'error' ? '✕ Erro' : 'ℹ️ Informação');
                  return `
                    <tr>
                      <td style="white-space:nowrap; color:var(--text-muted); font-size:0.8rem;"><strong>${log.timestamp}</strong></td>
                      <td><span class="status-tag ${badgeClass}">${badgeLabel}</span></td>
                      <td>
                        <strong>${log.user}</strong>
                        ${log.userEmail !== 'N/A' ? `<div style="font-size:0.75rem; color:var(--text-dim);">${log.userEmail}</div>` : ''}
                      </td>
                      <td>${log.message}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  container.innerHTML = settingsHtml;

  // Bind Theme Selector in Settings Page
  const settingsThemeSelector = document.getElementById('settings-theme-selector');
  if (settingsThemeSelector) {
    settingsThemeSelector.addEventListener('change', (e) => {
      const selectedTheme = e.target.value;
      document.documentElement.setAttribute('data-theme', selectedTheme);
      localStorage.setItem('library_theme', selectedTheme);

      const themeNames = {
        parchment: '📜 Pergaminho (Sépia)',
        camomila: '🌿 Camomila (Verde)',
        dark: '🌙 Escuro (Midnight)',
        light: '☀️ Claro (Nórdico)',
        violet: '💜 Violeta (Cyber)'
      };

      showToast(`Tema ${themeNames[selectedTheme] || selectedTheme} ativado!`, 'success');
    });
  }

  // Bind Password Change Form for All Users
  const formChangePassword = document.getElementById('form-change-password');
  if (formChangePassword) {
    formChangePassword.addEventListener('submit', (e) => {
      e.preventDefault();
      const p1 = document.getElementById('new-password').value;
      const p2 = document.getElementById('confirm-password').value;

      if (!p1 || p1.length < 4) {
        showToast('A palavra-passe deve ter pelo menos 4 caracteres', 'error');
        return;
      }

      if (p1 !== p2) {
        showToast('As palavras-passe introduzidas não coincidem', 'error');
        return;
      }

      try {
        const user = store.getCurrentUser();
        const member = store.getMembers().find(m => m.email.toLowerCase() === user.email.toLowerCase()) || user;
        store.updateMemberPassword(member.id, p1);
        showToast('Palavra-passe alterada com sucesso!', 'success');
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Admin Only Features
  if (isLibrarian) {
    const btnExportBackup = document.getElementById('btn-export-backup');
    if (btnExportBackup) {
      btnExportBackup.addEventListener('click', () => {
        store.exportBackup();
        showToast('Cópia de segurança exportada com sucesso!', 'success');
      });
    }

    const importInput = document.getElementById('import-file-input');
    const btnTriggerImport = document.getElementById('btn-trigger-import');
    const btnResetSeed = document.getElementById('btn-reset-seed');

    if (btnTriggerImport) {
      btnTriggerImport.addEventListener('click', () => importInput.click());
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            store.importBackup(event.target.result);
            showToast('Base de dados restaurada com sucesso!', 'success');
            setTimeout(() => window.location.reload(), 1000);
          } catch (err) {
            showToast(err.message, 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    if (btnResetSeed) {
      btnResetSeed.addEventListener('click', () => {
        if (confirm('Tem a certeza que deseja repor a coleção inicial do Excel? Todas as alterações manuais serão substituídas.')) {
          store.resetToSeedData();
          showToast('Dados restaurados para a versão inicial do Excel!', 'success');
          setTimeout(() => window.location.reload(), 1000);
        }
      });
    }

    const cloudForm = document.getElementById('cloud-config-form');
    if (cloudForm) {
      cloudForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('cloud-url').value.trim();
        const key = document.getElementById('cloud-key').value.trim();
        store.setCloudConfig(url, key);
        showToast('Credenciais guardadas! A testar ligação ao Supabase...', 'info');

        try {
          await store.syncAllToCloud();
          showToast('Ligação ao Supabase estabelecida! Todos os dados foram sincronizados com sucesso.', 'success');
          renderSettings(container);
        } catch (err) {
          showToast('Ligação guardada. Execute supabase_schema.sql no Supabase se ainda não criou as tabelas.', 'info');
        }
      });
    }

    const btnPush = document.getElementById('btn-cloud-push');
    const btnPull = document.getElementById('btn-cloud-pull');

    if (btnPush) {
      btnPush.addEventListener('click', async () => {
        showToast('A enviar dados para o Supabase...', 'info');
        try {
          await store.syncAllToCloud();
          showToast('Todos os livros, leitores e empréstimos foram enviados para o Supabase!', 'success');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }

    if (btnPull) {
      btnPull.addEventListener('click', async () => {
        showToast('A carregar dados do Supabase...', 'info');
        try {
          await store.fetchFromCloud();
          showToast('Dados remotos do Supabase carregados com sucesso!', 'success');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }

    // Log Controls Handlers
    const logSearchInput = document.getElementById('log-search-input');
    if (logSearchInput) {
      logSearchInput.addEventListener('input', (e) => {
        logSearchQuery = e.target.value;
        const cursorPos = e.target.selectionStart;
        renderSettings(container);
        const newInp = document.getElementById('log-search-input');
        if (newInp) {
          newInp.focus();
          newInp.setSelectionRange(cursorPos, cursorPos);
        }
      });
    }

    const logTypeFilter = document.getElementById('log-type-filter');
    if (logTypeFilter) {
      logTypeFilter.addEventListener('change', (e) => {
        logFilterType = e.target.value;
        renderSettings(container);
      });
    }

    const btnClearLogs = document.getElementById('btn-clear-logs');
    if (btnClearLogs) {
      btnClearLogs.addEventListener('click', () => {
        if (confirm('Tem a certeza que deseja eliminar todo o histórico de registos de notificações?')) {
          store.clearToastLogs();
          showToast('Histórico de registos de notificações limpo', 'info');
          renderSettings(container);
        }
      });
    }

    const btnExportLogs = document.getElementById('btn-export-logs');
    if (btnExportLogs) {
      btnExportLogs.addEventListener('click', () => {
        store.exportToastLogs();
      });
    }
  }
}

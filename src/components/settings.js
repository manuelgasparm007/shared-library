import { store } from '../data/store.js';
import { showToast } from './toast.js';

export function renderSettings(container) {
  const currentUser = store.getCurrentUser();
  const isLibrarian = currentUser.role === 'librarian';
  const cloudConfig = store.getCloudConfig();

  const settingsHtml = `
    <div>
      <h2 style="font-size:1.8rem;">Definições & Cópia de Segurança</h2>
      <p style="color:var(--text-muted); font-size:0.9rem;">Gestão da base de dados, exportação de ficheiros e sincronização cloud</p>
    </div>

    <!-- Cards Grid -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;">
      <!-- Backup & Data Management Card -->
      <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; gap:1.25rem;">
        <h3>💾 Cópias de Segurança (Backup JSON)</h3>
        <p style="color:var(--text-muted); font-size:0.88rem;">Guarde um instantâneo completo de todos os livros, leitores e histórico de empréstimos em ficheiro JSON, ou restaure dados guardados anteriormente.</p>

        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <button id="btn-export-backup" class="btn btn-primary">📥 Exportar Cópia de Segurança (JSON)</button>
          
          ${isLibrarian ? `
            <div style="position:relative;">
              <input type="file" id="import-file-input" accept=".json" style="display:none;">
              <button id="btn-trigger-import" class="btn btn-secondary" style="width:100%;">📤 Importar Ficheiro de Cópia (JSON)</button>
            </div>
            
            <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-glass);">
              <button id="btn-reset-seed" class="btn btn-danger btn-sm" style="width:100%;">🔄 Repor Dados Iniciais do Excel (Reset)</button>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Supabase Cloud Sync Card -->
      <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; gap:1.25rem;">
        <h3>🌩️ Sincronização Cloud (Supabase)</h3>
        <p style="color:var(--text-muted); font-size:0.88rem;">Conecte uma base de dados Supabase para permitir que múltiplos bibliotecários e leitores vejam alterações em tempo real em todos os dispositivos.</p>

        <form id="cloud-config-form" style="display:flex; flex-direction:column; gap:1rem;">
          <div class="form-group">
            <label>Supabase Project URL</label>
            <input type="url" id="cloud-url" value="${cloudConfig.url || ''}" placeholder="https://xyzcompany.supabase.co" ${!isLibrarian ? 'disabled' : ''}>
          </div>

          <div class="form-group">
            <label>Supabase Anon Key</label>
            <input type="password" id="cloud-key" value="${cloudConfig.key || ''}" placeholder="eyJhbGciOiJIUzI1NiIsInR5..." ${!isLibrarian ? 'disabled' : ''}>
          </div>

          ${isLibrarian ? `<button type="submit" class="btn btn-primary">Guardar Credenciais Cloud</button>` : ''}
        </form>

        <div style="font-size:0.8rem; color:var(--text-dim); background:var(--bg-glass); padding:0.75rem; border-radius:var(--radius-md);">
          ℹ️ <strong>Ficheiro SQL Incluído:</strong> Execute o ficheiro <code style="color:var(--accent-primary);">supabase_schema.sql</code> no Editor SQL do Supabase para criar as tabelas automaticamente em 1 clique.
        </div>
      </div>
    </div>
  `;

  container.innerHTML = settingsHtml;

  // Bind Export
  document.getElementById('btn-export-backup').addEventListener('click', () => {
    store.exportBackup();
    showToast('Cópia de segurança exportada com sucesso!', 'success');
  });

  if (isLibrarian) {
    const importInput = document.getElementById('import-file-input');
    const btnTriggerImport = document.getElementById('btn-trigger-import');
    const btnResetSeed = document.getElementById('btn-reset-seed');

    btnTriggerImport.addEventListener('click', () => importInput.click());

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

    btnResetSeed.addEventListener('click', () => {
      if (confirm('Tem a certeza que deseja repor o acervo inicial do Excel? Todas as alterações manuais serão substituídas.')) {
        store.resetToSeedData();
        showToast('Dados restaurados para a versão inicial do Excel!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      }
    });

    document.getElementById('cloud-config-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const url = document.getElementById('cloud-url').value.trim();
      const key = document.getElementById('cloud-key').value.trim();
      store.setCloudConfig(url, key);
      showToast('Credenciais de Sincronização Cloud guardadas com sucesso!', 'success');
    });
  }
}

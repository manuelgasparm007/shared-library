import { store } from '../data/store.js';
import { setCatalogFilter } from './catalog.js';
import { setLoansFilter } from './loans.js';

export function renderDashboard(container) {
  const books = store.getBooks();
  const members = store.getMembers();
  const loans = store.getLoans();
  const currentUser = store.getCurrentUser();
  const isLibrarian = currentUser.role === 'librarian';

  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.status === 'Disponível').length;
  const borrowedBooks = books.filter(b => b.status === 'Emprestado').length;
  const overdueLoans = loans.filter(l => l.isOverdue).length;

  const recentLoans = [...loans]
    .sort((a, b) => b.id.localeCompare(a.id, 'en', { numeric: true }))
    .slice(0, 5);

  // Genre distribution calculation
  const genreCounts = {};
  books.forEach(b => {
    const mainGenre = b.genre ? b.genre.split(',')[0].trim() : 'Outros';
    genreCounts[mainGenre] = (genreCounts[mainGenre] || 0) + 1;
  });

  const dashboardHtml = `
    <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h2 style="font-size:1.8rem;">Painel de Controlo - Biblioteca Camomila</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">Visão geral da coleção, requisições ativas e estatísticas</p>
      </div>
      ${isLibrarian ? `
        <div style="display:flex; gap:0.75rem;">
          <button id="quick-add-book" class="btn btn-secondary btn-sm">➕ Novo Livro</button>
          <button id="quick-checkout" class="btn btn-primary btn-sm">📖 Novo Empréstimo</button>
        </div>
      ` : ''}
    </div>

    <!-- Metrics KPI Cards -->
    <div class="metrics-grid">
      <div class="metric-card kpi-card-nav" data-nav-target="catalog" data-filter-type="total" style="cursor:pointer;" title="Ver Todos os Livros no Catálogo">
        <div class="metric-icon-box indigo">📚</div>
        <div class="metric-info">
          <h4>Total da Coleção</h4>
          <div class="value">${totalBooks}</div>
        </div>
      </div>

      <div class="metric-card kpi-card-nav" data-nav-target="catalog" data-filter-type="available" style="cursor:pointer;" title="Ver Livros Disponíveis no Catálogo">
        <div class="metric-icon-box emerald">✅</div>
        <div class="metric-info">
          <h4>Disponíveis</h4>
          <div class="value">${availableBooks}</div>
        </div>
      </div>

      <div class="metric-card kpi-card-nav" data-nav-target="catalog" data-filter-type="borrowed" style="cursor:pointer;" title="Ver Livros Emprestados no Catálogo">
        <div class="metric-icon-box amber">📖</div>
        <div class="metric-info">
          <h4>Emprestados</h4>
          <div class="value">${borrowedBooks}</div>
        </div>
      </div>

      <div class="metric-card kpi-card-nav" data-nav-target="loans" data-filter-type="overdue" style="cursor:pointer;" title="Ver Empréstimos em Atraso">
        <div class="metric-icon-box rose">⚠️</div>
        <div class="metric-info">
          <h4>Em Atraso</h4>
          <div class="value" style="color:var(--accent-danger);">${overdueLoans}</div>
        </div>
      </div>

      <div class="metric-card kpi-card-nav" data-nav-target="members" data-filter-type="members" style="cursor:pointer;" title="Ver Directório de Leitores">
        <div class="metric-icon-box indigo">👥</div>
        <div class="metric-info">
          <h4>Leitores Registados</h4>
          <div class="value">${members.length}</div>
        </div>
      </div>
    </div>

    <!-- Main Grid: Recent Activity + Category Distribution -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem; margin-top:0.5rem;">
      <!-- Recent Loans Stream -->
      <div class="table-container">
        <div class="table-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3>📌 Empréstimos Recentes</h3>
          <button id="btn-view-all-loans" class="btn btn-secondary btn-sm" style="font-size:0.75rem;">Ver Todos ➔</button>
        </div>
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Livro</th>
              <th>Requisitante</th>
              <th>Data Limite</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${recentLoans.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:var(--text-dim);">Nenhum empréstimo registado</td></tr>' : ''}
            ${recentLoans.map(loan => {
              const book = store.getBookById(loan.bookId);
              const statusClass = loan.status === 'Devolvido' ? 'returned' : (loan.isOverdue ? 'overdue' : 'borrowed');
              const statusLabel = loan.status === 'Devolvido' ? 'Devolvido' : (loan.isOverdue ? 'Atrasado' : 'Emprestado');

              return `
                <tr>
                  <td><strong>${loan.id}</strong></td>
                  <td>${book ? book.title : loan.bookId}</td>
                  <td>${loan.memberName}</td>
                  <td>${loan.dueDate}</td>
                  <td><span class="status-tag ${statusClass}">${statusLabel}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Categories breakdown card -->
      <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <h3 style="font-size:1.1rem;">📊 Distribuição por Género</h3>
        <div style="display:flex; flex-direction:column; gap:0.85rem;">
          ${Object.entries(genreCounts)
            .sort(([genreA], [genreB]) => genreA.localeCompare(genreB, 'pt'))
            .map(([genre, count]) => {
            const percentage = Math.round((count / totalBooks) * 100);
            return `
              <div class="genre-item-nav" data-genre="${genre}" style="cursor:pointer;" title="Filtrar Catálogo por ${genre}">
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:500; margin-bottom:0.25rem;">
                  <span>${genre}</span>
                  <span style="color:var(--text-muted);">${count} livros (${percentage}%)</span>
                </div>
                <div style="height:6px; background:var(--bg-glass); border-radius:var(--radius-full); overflow:hidden;">
                  <div style="width:${percentage}%; height:100%; background:linear-gradient(90deg, var(--accent-primary), #818cf8); border-radius:var(--radius-full);"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = dashboardHtml;

  // Bind Metric KPI Cards Navigation
  container.querySelectorAll('.kpi-card-nav').forEach(card => {
    card.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.navTarget;
      const filterType = e.currentTarget.dataset.filterType;

      if (target === 'catalog') {
        if (filterType === 'total') {
          setCatalogFilter({ genre: 'ALL', status: 'ALL' });
        } else if (filterType === 'available') {
          setCatalogFilter({ genre: 'ALL', status: 'Disponível' });
        } else if (filterType === 'borrowed') {
          setCatalogFilter({ genre: 'ALL', status: 'Emprestado' });
        }
        document.querySelector('[data-view="catalog"]').click();
      } else if (target === 'loans') {
        if (filterType === 'overdue') {
          setLoansFilter('OVERDUE');
        }
        document.querySelector('[data-view="loans"]').click();
      } else if (target === 'members') {
        document.querySelector('[data-view="members"]').click();
      }
    });
  });

  // Bind Genre Bars Click Handler
  container.querySelectorAll('.genre-item-nav').forEach(item => {
    item.addEventListener('click', (e) => {
      const genre = e.currentTarget.dataset.genre;
      setCatalogFilter({ genre: genre, status: 'ALL' });
      document.querySelector('[data-view="catalog"]').click();
    });
  });

  // View All Loans Button
  const btnViewAllLoans = document.getElementById('btn-view-all-loans');
  if (btnViewAllLoans) {
    btnViewAllLoans.addEventListener('click', () => {
      setLoansFilter('ALL');
      document.querySelector('[data-view="loans"]').click();
    });
  }

  // Quick Actions
  const btnQuickAdd = document.getElementById('quick-add-book');
  const btnQuickCheckout = document.getElementById('quick-checkout');

  if (btnQuickAdd) {
    btnQuickAdd.addEventListener('click', () => {
      document.querySelector('[data-view="catalog"]').click();
      setTimeout(() => {
        const addBtn = document.getElementById('btn-add-book-modal');
        if (addBtn) addBtn.click();
      }, 100);
    });
  }

  if (btnQuickCheckout) {
    btnQuickCheckout.addEventListener('click', () => {
      document.querySelector('[data-view="loans"]').click();
      setTimeout(() => {
        const checkoutBtn = document.getElementById('btn-checkout-modal');
        if (checkoutBtn) checkoutBtn.click();
      }, 100);
    });
  }
}

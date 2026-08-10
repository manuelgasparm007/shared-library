import { store } from '../data/store.js';
import { showToast } from './toast.js';

let currentViewMode = 'table'; // 'table' or 'grid'
let searchQuery = '';
let selectedGenre = 'ALL';
let selectedStatus = 'ALL';
let sortBy = 'title_asc'; // 'title_asc', 'title_desc', 'author_asc', 'year_desc', 'year_asc', 'status_avail', 'id_asc'

export function renderCatalog(container) {
  const currentUser = store.getCurrentUser();
  const isLibrarian = currentUser.role === 'librarian';
  const books = store.getBooks();
  const genres = store.getGenres();
  const statuses = store.getStatuses();

  // Filter books based on search & drop downs
  let filteredBooks = books.filter(book => {
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.shelfLocation && book.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'ALL' || (book.genre && book.genre.includes(selectedGenre));
    const matchesStatus = selectedStatus === 'ALL' || book.status === selectedStatus;

    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Sort books based on selected criterion
  filteredBooks.sort((a, b) => {
    switch (sortBy) {
      case 'title_asc':
        return a.title.localeCompare(b.title, 'pt');
      case 'title_desc':
        return b.title.localeCompare(a.title, 'pt');
      case 'author_asc':
        return a.author.localeCompare(b.author, 'pt');
      case 'year_desc':
        return (b.pubYear || 0) - (a.pubYear || 0);
      case 'year_asc':
        return (a.pubYear || 0) - (b.pubYear || 0);
      case 'status_avail':
        return (a.status === 'Disponível' ? 0 : 1) - (b.status === 'Disponível' ? 0 : 1);
      case 'id_asc':
      default:
        return a.id.localeCompare(b.id, 'en', { numeric: true });
    }
  });

  const catalogHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      <div>
        <h2 style="font-size:1.8rem;">Catálogo - Biblioteca Camomila</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">Explore e pesquise livros no acervo da biblioteca (${filteredBooks.length} de ${books.length})</p>
      </div>

      <div style="display:flex; gap:0.75rem; align-items:center;">
        <!-- Layout Switcher -->
        <div style="background:var(--bg-glass); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:0.2rem; display:flex;">
          <button id="view-grid-btn" class="btn btn-sm ${currentViewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}" style="border:none;">🖼️ Grelha</button>
          <button id="view-table-btn" class="btn btn-sm ${currentViewMode === 'table' ? 'btn-primary' : 'btn-secondary'}" style="border:none;">📋 Tabela</button>
        </div>

        ${isLibrarian ? `<button id="btn-add-book-modal" class="btn btn-primary">➕ Adicionar Livro</button>` : ''}
      </div>
    </div>

    <!-- Filters & Sorting Bar -->
    <div style="display:grid; grid-template-columns: 2fr 1fr 1fr 1.25fr; gap:1rem; background:var(--bg-card); padding:1rem 1.25rem; border-radius:var(--radius-lg); border:1px solid var(--border-glass);">
      <div class="form-group" style="margin:0;">
        <input type="text" id="catalog-search-input" placeholder="🔍 Pesquisar por título, autor, ISBN ou prateleira..." value="${searchQuery}">
      </div>

      <div class="form-group" style="margin:0;">
        <select id="catalog-genre-filter">
          <option value="ALL">Todos os Géneros (${genres.length})</option>
          ${genres.map(g => `<option value="${g}" ${selectedGenre === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin:0;">
        <select id="catalog-status-filter">
          <option value="ALL">Todos os Estados</option>
          ${statuses.map(s => `<option value="${s}" ${selectedStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin:0;">
        <select id="catalog-sort-filter">
          <option value="title_asc" ${sortBy === 'title_asc' ? 'selected' : ''}>🔤 Ordenar: Título (A - Z)</option>
          <option value="title_desc" ${sortBy === 'title_desc' ? 'selected' : ''}>🔤 Ordenar: Título (Z - A)</option>
          <option value="author_asc" ${sortBy === 'author_asc' ? 'selected' : ''}>👤 Ordenar: Autor (A - Z)</option>
          <option value="year_desc" ${sortBy === 'year_desc' ? 'selected' : ''}>📅 Ordenar: Ano (Mais Recente)</option>
          <option value="year_asc" ${sortBy === 'year_asc' ? 'selected' : ''}>📅 Ordenar: Ano (Mais Antigo)</option>
          <option value="status_avail" ${sortBy === 'status_avail' ? 'selected' : ''}>✅ Ordenar: Disponíveis Primeiro</option>
          <option value="id_asc" ${sortBy === 'id_asc' ? 'selected' : ''}>🏷️ Ordenar: ID de Registo</option>
        </select>
      </div>
    </div>

    <!-- Main Inventory Viewport -->
    <div id="catalog-inventory-container">
      ${filteredBooks.length === 0 ? `
        <div style="text-align:center; padding:4rem 2rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-glass);">
          <div style="font-size:3rem; margin-bottom:1rem;">🔍</div>
          <h3>Nenhum livro encontrado</h3>
          <p style="color:var(--text-muted);">Tente ajustar os termos de pesquisa ou filtros</p>
        </div>
      ` : (currentViewMode === 'grid' ? renderGrid(filteredBooks, isLibrarian) : renderTable(filteredBooks, isLibrarian))}
    </div>

    <!-- Modal Containers -->
    <div id="book-modal-portal"></div>
  `;

  container.innerHTML = catalogHtml;

  // Bind Listeners
  document.getElementById('view-grid-btn').addEventListener('click', () => {
    currentViewMode = 'grid';
    renderCatalog(container);
  });

  document.getElementById('view-table-btn').addEventListener('click', () => {
    currentViewMode = 'table';
    renderCatalog(container);
  });

  const searchInput = document.getElementById('catalog-search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCatalog(container);
  });

  document.getElementById('catalog-genre-filter').addEventListener('change', (e) => {
    selectedGenre = e.target.value;
    renderCatalog(container);
  });

  document.getElementById('catalog-status-filter').addEventListener('change', (e) => {
    selectedStatus = e.target.value;
    renderCatalog(container);
  });

  document.getElementById('catalog-sort-filter').addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderCatalog(container);
  });

  container.querySelectorAll('.sortable-header').forEach(header => {
    header.addEventListener('click', (e) => {
      sortBy = e.currentTarget.dataset.sortTarget;
      renderCatalog(container);
    });
  });

  if (isLibrarian) {
    const addBtn = document.getElementById('btn-add-book-modal');
    if (addBtn) {
      addBtn.addEventListener('click', () => openBookModal(null, () => renderCatalog(container)));
    }
  }

  // Bind Actions on Book Cards / Rows
  container.querySelectorAll('.btn-edit-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bookId = e.currentTarget.dataset.id;
      const book = store.getBookById(bookId);
      openBookModal(book, () => renderCatalog(container));
    });
  });

  container.querySelectorAll('.btn-delete-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bookId = e.currentTarget.dataset.id;
      if (confirm('Tem a certeza que deseja eliminar este livro do acervo?')) {
        store.deleteBook(bookId);
        showToast('Livro eliminado com sucesso', 'success');
        renderCatalog(container);
      }
    });
  });

  container.querySelectorAll('.btn-view-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bookId = e.currentTarget.dataset.id;
      const book = store.getBookById(bookId);
      openBookDetailModal(book);
    });
  });
}

function renderGrid(books, isLibrarian) {
  return `
    <div class="books-grid">
      ${books.map(book => {
        const isAvailable = book.status === 'Disponível';
        const statusClass = isAvailable ? 'available' : (book.status === 'Emprestado' ? 'borrowed' : 'overdue');

        return `
          <div class="book-card">
            <div class="book-cover">
              ${book.coverUrl ? `<img src="${book.coverUrl}" alt="${book.title}">` : `
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">📖</div>
                <div class="book-cover-title">${book.title}</div>
                <div class="book-cover-author">${book.author}</div>
              `}
            </div>

            <div class="book-details">
              <div style="display:flex; justify-content:space-between; align-items:start; gap:0.5rem;">
                <span class="status-tag ${statusClass}">${book.status}</span>
                <span style="font-size:0.75rem; color:var(--text-dim); font-weight:700;">ID: ${book.id}</span>
              </div>

              <div class="book-title" style="margin-top:0.4rem;">${book.title}</div>
              <div class="book-author">${book.author}</div>

              <div class="book-meta">
                <span>📂 ${book.genre || 'Geral'}</span>
                <span>📅 ${book.pubYear || 'N/A'}</span>
              </div>
            </div>

            <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-glass); display:flex; gap:0.5rem; justify-content:flex-end;">
              <button class="btn btn-secondary btn-sm btn-view-book" data-id="${book.id}">👁️ Detalhes</button>
              ${isLibrarian ? `
                <button class="btn btn-secondary btn-sm btn-edit-book" data-id="${book.id}">✏️ Editar</button>
                <button class="btn btn-danger btn-sm btn-delete-book" data-id="${book.id}">🗑️</button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderTable(books, isLibrarian) {
  const getSortIcon = (target) => {
    if (sortBy === target) return ' ▲';
    if (target === 'title_asc' && sortBy === 'title_desc') return ' ▼';
    if (target === 'year_desc' && sortBy === 'year_asc') return ' ▲';
    return '';
  };

  return `
    <div class="table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th class="sortable-header" data-sort-target="id_asc" style="cursor:pointer;" title="Ordenar por ID">ID${getSortIcon('id_asc')}</th>
            <th class="sortable-header" data-sort-target="${sortBy === 'title_asc' ? 'title_desc' : 'title_asc'}" style="cursor:pointer;" title="Ordenar por Título">Título${getSortIcon('title_asc') || getSortIcon('title_desc')}</th>
            <th class="sortable-header" data-sort-target="author_asc" style="cursor:pointer;" title="Ordenar por Autor">Autor${getSortIcon('author_asc')}</th>
            <th>Género</th>
            <th class="sortable-header" data-sort-target="${sortBy === 'year_desc' ? 'year_asc' : 'year_desc'}" style="cursor:pointer;" title="Ordenar por Ano">Ano${getSortIcon('year_desc') || getSortIcon('year_asc')}</th>
            <th>Prateleira</th>
            <th class="sortable-header" data-sort-target="status_avail" style="cursor:pointer;" title="Ordenar por Disponibilidade">Estado${getSortIcon('status_avail')}</th>
            <th style="text-align:right;">Acções</th>
          </tr>
        </thead>
        <tbody>
          ${books.map(book => {
            const statusClass = book.status === 'Disponível' ? 'available' : (book.status === 'Emprestado' ? 'borrowed' : 'overdue');
            return `
              <tr>
                <td><strong>${book.id}</strong></td>
                <td><strong>${book.title}</strong></td>
                <td>${book.author}</td>
                <td>${book.genre}</td>
                <td>${book.pubYear || 'N/A'}</td>
                <td><span style="color:var(--text-muted); font-size:0.85rem;">📍 ${book.shelfLocation || 'A-1'}</span></td>
                <td><span class="status-tag ${statusClass}">${book.status}</span></td>
                <td style="text-align:right;">
                  <button class="btn btn-secondary btn-sm btn-view-book" data-id="${book.id}">👁️</button>
                  ${isLibrarian ? `
                    <button class="btn btn-secondary btn-sm btn-edit-book" data-id="${book.id}">✏️</button>
                    <button class="btn btn-danger btn-sm btn-delete-book" data-id="${book.id}">🗑️</button>
                  ` : ''}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openBookModal(book, onSave) {
  const portal = document.getElementById('book-modal-portal');
  const isEdit = !!book;
  const genres = store.getGenres();
  const statuses = store.getStatuses();

  portal.innerHTML = `
    <div class="modal-backdrop-overlay" id="backdrop-book-modal"></div>
    <dialog id="modal-book-form" class="custom-modal" open>
      <div class="modal-header">
        <h3>${isEdit ? '✏️ Editar Livro' : '➕ Adicionar Novo Livro'}</h3>
        <button id="btn-close-book-modal" class="btn btn-secondary btn-sm" style="border:none;">✕</button>
      </div>

      <form id="form-book" class="modal-body" style="max-height:70vh; overflow-y:auto;">
        <div class="form-group">
          <label>Título do Livro *</label>
          <input type="text" id="book-title" required value="${book ? book.title : ''}">
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label>Autor *</label>
            <input type="text" id="book-author" required value="${book ? book.author : ''}">
          </div>

          <div class="form-group">
            <label>Ano de Publicação</label>
            <input type="number" id="book-pub-year" value="${book ? book.pubYear : 2024}">
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label>Género Principal</label>
            <select id="book-genre">
              ${genres.map(g => `<option value="${g}" ${book && book.genre === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Estado</label>
            <select id="book-status">
              ${statuses.map(s => `<option value="${s}" ${book && book.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label>ISBN / Código de Barras</label>
            <input type="text" id="book-isbn" value="${book ? (book.isbn || '') : ''}" placeholder="ex: 978-972-0-00000-0">
          </div>

          <div class="form-group">
            <label>Prateleira / Localização</label>
            <input type="text" id="book-shelf" value="${book ? (book.shelfLocation || 'Prateleira A1') : 'Prateleira A1'}">
          </div>
        </div>

        <div class="form-group">
          <label>URL da Imagem de Capa (Opcional)</label>
          <input type="url" id="book-cover-url" value="${book ? (book.coverUrl || '') : ''}" placeholder="https://exemplo.com/capa.jpg">
        </div>

        <div class="form-group">
          <label>Sinopse / Notas</label>
          <textarea id="book-synopsis" rows="3" placeholder="Resumo do conteúdo ou observações sobre o estado do exemplar...">${book ? (book.synopsis || '') : ''}</textarea>
        </div>
      </form>

      <div class="modal-footer">
        <button id="btn-cancel-book" class="btn btn-secondary">Cancelar</button>
        <button id="btn-save-book" class="btn btn-primary">${isEdit ? 'Guardar Alterações' : 'Adicionar ao Acervo'}</button>
      </div>
    </dialog>
  `;

  const closeModal = () => portal.innerHTML = '';

  document.getElementById('btn-close-book-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-book').addEventListener('click', closeModal);
  document.getElementById('backdrop-book-modal').addEventListener('click', closeModal);

  document.getElementById('btn-save-book').addEventListener('click', () => {
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();

    if (!title || !author) {
      showToast('Título e Autor são obrigatórios', 'error');
      return;
    }

    const bookData = {
      title,
      author,
      pubYear: document.getElementById('book-pub-year').value,
      genre: document.getElementById('book-genre').value,
      status: document.getElementById('book-status').value,
      isbn: document.getElementById('book-isbn').value,
      shelfLocation: document.getElementById('book-shelf').value,
      coverUrl: document.getElementById('book-cover-url').value,
      synopsis: document.getElementById('book-synopsis').value
    };

    if (isEdit) {
      store.updateBook(book.id, bookData);
      showToast('Livro actualizado com sucesso!', 'success');
    } else {
      store.addBook(bookData);
      showToast('Livro adicionado ao acervo!', 'success');
    }

    closeModal();
    if (onSave) onSave();
  });
}

function openBookDetailModal(book) {
  const portal = document.getElementById('book-modal-portal');
  portal.innerHTML = `
    <div class="modal-backdrop-overlay" id="backdrop-detail-modal"></div>
    <dialog id="modal-book-detail" class="custom-modal" open>
      <div class="modal-header">
        <h3>📖 Detalhes da Obra</h3>
        <button id="btn-close-detail" class="btn btn-secondary btn-sm" style="border:none;">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:flex; gap:1.25rem;">
          <div style="width:120px; height:160px; background:linear-gradient(135deg, #312e81, #4338ca); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:#fff; text-align:center; padding:0.5rem; flex-shrink:0;">
            ${book.coverUrl ? `<img src="${book.coverUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:var(--radius-md);">` : '📖'}
          </div>

          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <h2 style="font-size:1.4rem; line-height:1.2;">${book.title}</h2>
            <div style="color:var(--text-muted); font-size:0.95rem;">Por <strong>${book.author}</strong></div>
            <div style="margin-top:0.25rem;"><span class="status-tag ${book.status === 'Disponível' ? 'available' : 'borrowed'}">${book.status}</span></div>

            <div style="margin-top:0.75rem; display:flex; flex-direction:column; gap:0.25rem; font-size:0.85rem; color:var(--text-muted);">
              <div><strong>ID:</strong> ${book.id}</div>
              <div><strong>Género:</strong> ${book.genre || 'Geral'}</div>
              <div><strong>Ano de Publicação:</strong> ${book.pubYear || 'N/A'}</div>
              <div><strong>Localização:</strong> ${book.shelfLocation || 'Prateleira A1'}</div>
              ${book.isbn ? `<div><strong>ISBN:</strong> ${book.isbn}</div>` : ''}
            </div>
          </div>
        </div>

        ${book.synopsis ? `
          <div style="margin-top:1rem; padding:1rem; background:var(--bg-glass); border-radius:var(--radius-md); border:1px solid var(--border-glass);">
            <div style="font-weight:700; font-size:0.85rem; margin-bottom:0.35rem; color:var(--text-muted);">SINOPSE / RESUMO</div>
            <p style="font-size:0.9rem; line-height:1.5;">${book.synopsis}</p>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button id="btn-close-detail-footer" class="btn btn-primary">Fechar</button>
      </div>
    </dialog>
  `;

  const closeModal = () => portal.innerHTML = '';

  document.getElementById('btn-close-detail').addEventListener('click', closeModal);
  document.getElementById('btn-close-detail-footer').addEventListener('click', closeModal);
  document.getElementById('backdrop-detail-modal').addEventListener('click', closeModal);
}

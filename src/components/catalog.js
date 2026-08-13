import { store } from '../data/store.js';
import { showToast } from './toast.js';
import { escapeHtml } from '../utils/sanitize.js';

let currentViewMode = 'table'; // 'table' or 'grid'
let searchQuery = '';
let selectedGenre = 'ALL';
let selectedStatus = 'ALL';
let sortBy = 'id_asc';

export function setCatalogFilter({ genre, status } = {}) {
  if (genre !== undefined) selectedGenre = genre;
  if (status !== undefined) selectedStatus = status;
}

export function resetCatalogFilters() {
  selectedGenre = 'ALL';
  selectedStatus = 'ALL';
  searchQuery = '';
}

// Global helper for querying Google Books & Open Library APIs with local collection fallback
async function fetchGlobalBookInfo(query) {
  let result = {
    title: '',
    author: '',
    pubYear: null,
    publisher: '',
    isbn: '',
    coverUrl: '',
    synopsis: '',
    genre: '',
    shelfLocation: ''
  };

  if (!query || !query.trim()) return null;

  const normalize = str => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const cleanIsbn = query.replace(/[^0-9X]/gi, '');
  const isDirectIsbnSearch = (cleanIsbn.length === 10 || cleanIsbn.length === 13);
  const normQuery = normalize(query);

  if (isDirectIsbnSearch) {
    result.isbn = cleanIsbn;
  }

  // 0. First check local catalog for instant PT-PT accent-insensitive match
  try {
    const localBooks = store.getBooks();
    const match = localBooks.find(b => {
      const bIsbn = (b.isbn || '').replace(/[^0-9X]/gi, '');
      if (isDirectIsbnSearch && bIsbn && bIsbn === cleanIsbn) return true;
      const bNormTitle = normalize(b.title);
      const bNormAuthor = normalize(b.author);
      return (bNormTitle && bNormTitle.includes(normQuery)) || (bNormAuthor && bNormAuthor.includes(normQuery));
    });

    if (match) {
      result.title = match.title || '';
      result.author = match.author || '';
      result.pubYear = match.pubYear || null;
      result.publisher = match.publisher || '';
      result.isbn = match.isbn || cleanIsbn;
      result.coverUrl = match.coverUrl || '';
      result.synopsis = match.synopsis || '';
      result.genre = match.genre || '';
      result.shelfLocation = match.shelfLocation || '';
    }
  } catch (e) {}

  // 1. Try Open Library Bibkeys API for direct ISBN search
  if (isDirectIsbnSearch) {
    try {
      const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`, { signal: AbortSignal.timeout(5000) });
      if (olRes.ok) {
        const olData = await olRes.json();
        const bookKey = `ISBN:${cleanIsbn}`;
        if (olData && olData[bookKey]) {
          const item = olData[bookKey];
          if (item.title) result.title = item.title;
          if (item.authors && item.authors.length > 0) {
            result.author = item.authors.map(a => a.name).join(', ');
          }
          if (item.publish_date) {
            const y = item.publish_date.match(/\d{4}/);
            if (y) result.pubYear = parseInt(y[0]);
          }
          if (item.publishers && item.publishers.length > 0) {
            result.publisher = typeof item.publishers[0] === 'string' ? item.publishers[0] : (item.publishers[0].name || '');
          }
          if (item.cover) {
            result.coverUrl = item.cover.large || item.cover.medium || item.cover.small || '';
          }
          if (item.notes) {
            result.synopsis = typeof item.notes === 'string' ? item.notes : (item.notes.value || '');
          }
          if (item.subjects && item.subjects.length > 0) {
            result.genre = item.subjects.slice(0, 2).map(s => s.name).join(', ');
          }
        }
      }
    } catch (err) {
      console.warn('Open Library bibkeys lookup error:', err);
    }
  }

  // 2. Try Google Books API with PT-PT and normalized queries
  if (!result.title || !result.coverUrl) {
    try {
      const gbQueries = isDirectIsbnSearch 
        ? [`isbn:${cleanIsbn}`] 
        : [query, normQuery];

      for (const q of gbQueries) {
        if (result.title && result.coverUrl) break;
        const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(5000) });
        if (gbRes.ok) {
          const gbData = await gbRes.json();
          if (gbData.items && gbData.items.length > 0) {
            const info = gbData.items[0].volumeInfo;
            if (!result.title && info.title) result.title = info.title;
            if (!result.author && info.authors) result.author = info.authors.join(', ');
            if (!result.pubYear && info.publishedDate) {
              const y = info.publishedDate.substring(0, 4);
              if (y) result.pubYear = parseInt(y);
            }
            if (!result.publisher && info.publisher) result.publisher = info.publisher;
            if (!result.synopsis && info.description) result.synopsis = info.description;

            if (!result.isbn && info.industryIdentifiers && Array.isArray(info.industryIdentifiers)) {
              const isbn13 = info.industryIdentifiers.find(i => i.type === 'ISBN_13');
              const isbn10 = info.industryIdentifiers.find(i => i.type === 'ISBN_10');
              result.isbn = isbn13 ? isbn13.identifier : (isbn10 ? isbn10.identifier : info.industryIdentifiers[0].identifier || '');
            }

            if (!result.coverUrl && info.imageLinks) {
              let img = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '';
              if (img.startsWith('http://')) img = img.replace('http://', 'https://');
              if (img) result.coverUrl = img;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Google Books API lookup error:', err);
    }
  }

  // 3. Fallback to Open Library Search API (Exact + Normalized Queries)
  if (!result.title || !result.author) {
    try {
      const searchQueries = isDirectIsbnSearch
        ? [`isbn=${cleanIsbn}`]
        : [`q=${encodeURIComponent(query)}`, `q=${encodeURIComponent(normQuery)}`, `author=${encodeURIComponent(normQuery)}`, `title=${encodeURIComponent(normQuery)}`];

      for (const sq of searchQueries) {
        if (result.title && result.author) break;
        const olSearchRes = await fetch(`https://openlibrary.org/search.json?${sq}`, { signal: AbortSignal.timeout(5000) });
        if (olSearchRes.ok) {
          const olSearchData = await olSearchRes.json();
          if (olSearchData && olSearchData.docs && olSearchData.docs.length > 0) {
            const doc = olSearchData.docs[0];
            if (!result.title && doc.title) result.title = doc.title;
            if (!result.author && doc.author_name) result.author = doc.author_name.join(', ');
            if (!result.pubYear) result.pubYear = doc.first_publish_year || (doc.publish_date ? parseInt(doc.publish_date[0]) : null);
            if (!result.publisher && doc.publisher) result.publisher = doc.publisher[0];
            if (!result.isbn && doc.isbn && Array.isArray(doc.isbn)) {
              const bestIsbn = doc.isbn.find(i => (i.startsWith('978') || i.startsWith('979')) && i.length === 13) || doc.isbn[0];
              result.isbn = bestIsbn;
            }
            if (!result.coverUrl && doc.cover_i) {
              result.coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Open Library Search lookup error:', err);
    }
  }

  if (isDirectIsbnSearch && !result.isbn) {
    result.isbn = cleanIsbn;
  }

  return (result.title || result.author) ? result : null;
}

export function setCatalogSearchQuery(query) {
  searchQuery = query || '';
}

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
      case 'id_desc':
        return b.id.localeCompare(a.id, 'en', { numeric: true });
      case 'title_asc':
        return a.title.localeCompare(b.title, 'pt');
      case 'title_desc':
        return b.title.localeCompare(a.title, 'pt');
      case 'author_asc':
        return a.author.localeCompare(b.author, 'pt');
      case 'author_desc':
        return b.author.localeCompare(a.author, 'pt');
      case 'genre_asc':
        return (a.genre || '').localeCompare(b.genre || '', 'pt');
      case 'genre_desc':
        return (b.genre || '').localeCompare(a.genre || '', 'pt');
      case 'year_desc':
        return (b.pubYear || 0) - (a.pubYear || 0);
      case 'year_asc':
        return (a.pubYear || 0) - (b.pubYear || 0);
      case 'isbn_asc':
        return (a.isbn || '').localeCompare(b.isbn || '');
      case 'isbn_desc':
        return (b.isbn || '').localeCompare(a.isbn || '');
      case 'status_asc':
        return (a.status || '').localeCompare(b.status || '', 'pt');
      case 'status_desc':
        return (b.status || '').localeCompare(a.status || '', 'pt');
      case 'id_asc':
      default:
        return a.id.localeCompare(b.id, 'en', { numeric: true });
    }
  });

  const catalogHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      <div>
        <h2 style="font-size:1.8rem;">Catálogo - Biblioteca Camomila</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">Explore e pesquise livros na coleção da biblioteca (${filteredBooks.length} de ${books.length})</p>
      </div>

      <div style="display:flex; gap:0.75rem; align-items:center;">
        <!-- Layout Switcher -->
        <div style="background:var(--bg-glass); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:0.2rem; display:flex;">
          <button id="view-grid-btn" class="btn btn-sm ${currentViewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}" style="border:none;">🖼️ Grelha</button>
          <button id="view-table-btn" class="btn btn-sm ${currentViewMode === 'table' ? 'btn-primary' : 'btn-secondary'}" style="border:none;">📋 Tabela</button>
        </div>

        ${isLibrarian ? `
          <button id="btn-refresh-all-books" class="btn btn-secondary btn-sm" title="Recarregar capas, ISBNs e sinopses de todos os livros na coleção via Google Books & Open Library">⚡ Recarregar Todos os Livros</button>
          <button id="btn-add-book-modal" class="btn btn-primary">➕ Adicionar Livro</button>
        ` : ''}
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
          <option value="id_asc" ${sortBy === 'id_asc' ? 'selected' : ''}>🔢 ID Livro (Crescente)</option>
          <option value="id_desc" ${sortBy === 'id_desc' ? 'selected' : ''}>🔢 ID Livro (Decrescente)</option>
          <option value="title_asc" ${sortBy === 'title_asc' ? 'selected' : ''}>🔤 Título (A - Z)</option>
          <option value="title_desc" ${sortBy === 'title_desc' ? 'selected' : ''}>🔤 Título (Z - A)</option>
          <option value="author_asc" ${sortBy === 'author_asc' ? 'selected' : ''}>👤 Autor (A - Z)</option>
          <option value="author_desc" ${sortBy === 'author_desc' ? 'selected' : ''}>👤 Autor (Z - A)</option>
          <option value="genre_asc" ${sortBy === 'genre_asc' ? 'selected' : ''}>🏷️ Género (A - Z)</option>
          <option value="genre_desc" ${sortBy === 'genre_desc' ? 'selected' : ''}>🏷️ Género (Z - A)</option>
          <option value="year_desc" ${sortBy === 'year_desc' ? 'selected' : ''}>📅 Ano (Mais Recente)</option>
          <option value="year_asc" ${sortBy === 'year_asc' ? 'selected' : ''}>📅 Ano (Mais Antigo)</option>
          <option value="isbn_asc" ${sortBy === 'isbn_asc' ? 'selected' : ''}>📑 ISBN (A - Z)</option>
          <option value="isbn_desc" ${sortBy === 'isbn_desc' ? 'selected' : ''}>📑 ISBN (Z - A)</option>
          <option value="status_asc" ${sortBy === 'status_asc' ? 'selected' : ''}>🟢 Estado (A - Z)</option>
          <option value="status_desc" ${sortBy === 'status_desc' ? 'selected' : ''}>🔴 Estado (Z - A)</option>
        </select>
      </div>
    </div>

    <!-- Active View Container -->
    <div id="catalog-view-content" style="margin-top:1rem;">
      ${filteredBooks.length === 0 ? `
        <div style="text-align:center; padding:4rem; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-glass);">
          <div style="font-size:3rem; margin-bottom:1rem;">🔍</div>
          <h3>Nenhum livro encontrado</h3>
          <p>Tente ajustar os termos de pesquisa ou remover os filtros aplicados.</p>
        </div>
      ` : (currentViewMode === 'grid' ? renderGrid(filteredBooks, isLibrarian) : renderTable(filteredBooks, isLibrarian))}
    </div>

    <!-- Book Form Portal & Detail Portal -->
    <div id="book-modal-portal"></div>
  `;

  container.innerHTML = catalogHtml;

  // View Switchers
  document.getElementById('view-grid-btn').addEventListener('click', () => {
    currentViewMode = 'grid';
    renderCatalog(container);
  });

  document.getElementById('view-table-btn').addEventListener('click', () => {
    currentViewMode = 'table';
    renderCatalog(container);
  });

  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      const cursorPos = e.target.selectionStart;
      renderCatalog(container);
      const newInp = document.getElementById('catalog-search-input');
      if (newInp) {
        newInp.focus();
        newInp.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }

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

    const btnRefreshAll = document.getElementById('btn-refresh-all-books');
    if (btnRefreshAll) {
      btnRefreshAll.addEventListener('click', async () => {
        const booksList = store.getBooks();
        if (booksList.length === 0) {
          showToast('Não existem livros na coleção para atualizar.', 'info');
          return;
        }

        if (!confirm(`Deseja pesquisar e atualizar capas, ISBNs e sinopses de todos os ${booksList.length} livros da coleção nas bases globais?`)) {
          return;
        }

        btnRefreshAll.disabled = true;
        showToast(`⚡ A iniciar atualização automática de ${booksList.length} livros...`, 'info');
        let updatedCount = 0;

        for (let i = 0; i < booksList.length; i++) {
          const book = booksList[i];
          showToast(`⚡ A atualizar (${i + 1}/${booksList.length}): "${book.title}"...`, 'info');

          try {
            const query = book.isbn || `${book.title} ${book.author}`;
            const fetchedData = await fetchGlobalBookInfo(query);

            if (fetchedData) {
              const updatedFields = {};
              if (fetchedData.coverUrl && (!book.coverUrl || book.coverUrl === '')) updatedFields.coverUrl = fetchedData.coverUrl;
              if (fetchedData.synopsis && (!book.synopsis || book.synopsis === '')) updatedFields.synopsis = fetchedData.synopsis;
              if (fetchedData.isbn) updatedFields.isbn = fetchedData.isbn; // Always update/enforce ISBN if found!
              if (fetchedData.pubYear && (!book.pubYear || book.pubYear === 2024)) updatedFields.pubYear = fetchedData.pubYear;

              if (Object.keys(updatedFields).length > 0) {
                store.updateBook(book.id, updatedFields);
                updatedCount++;
              }
            }
          } catch (err) {
            console.warn(`Error auto updating book ${book.id}:`, err);
          }

          await new Promise(r => setTimeout(r, 120));
        }

        showToast(`✨ Processo concluído! ${updatedCount} livro(s) foram atualizados com novas capas e ISBNs!`, 'success');
        renderCatalog(container);
      });
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
      const book = store.getBookById(bookId);
      if (confirm(`Tem a certeza que deseja eliminar o livro "${book.title}"?`)) {
        store.deleteBook(bookId);
        showToast('Livro eliminado com sucesso', 'info');
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
    <div class="grid-layout">
      ${books.map(book => {
        const statusClass = book.status === 'Disponível' ? 'available' : (book.status === 'Emprestado' ? 'borrowed' : 'overdue');
        return `
          <div class="book-card">
            <div class="book-cover-container">
              ${book.coverUrl ? `<img src="${book.coverUrl}" class="book-cover-img" alt="${book.title}">` : `<div style="font-size:2.5rem; opacity:0.6;">📖</div>`}
              <span class="status-tag ${statusClass}" style="position:absolute; top:0.75rem; right:0.75rem; font-size:0.75rem;">${book.status}</span>
            </div>
            
            <div class="book-details" style="display:flex; flex-direction:column; justify-content:space-between; flex:1;">
              <div>
                <div class="book-title" title="${book.title}">${book.title}</div>
                <div class="book-author">Por ${book.author}</div>
              </div>
              
              <div style="display:flex; justify-content:flex-end; align-items:center; margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid var(--border-glass);">
                <div class="action-buttons-group">
                  <button class="btn btn-secondary btn-sm btn-view-book" data-id="${book.id}" title="Ver Detalhes">👁️</button>
                  ${isLibrarian ? `
                    <button class="btn btn-secondary btn-sm btn-edit-book" data-id="${book.id}" title="Editar Livro">✏️</button>
                    <button class="btn btn-danger btn-sm btn-delete-book" data-id="${book.id}" title="Eliminar Livro">🗑️</button>
                  ` : ''}
                </div>
              </div>
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
            <th class="sortable-header" data-sort-target="${sortBy === 'id_asc' ? 'id_desc' : 'id_asc'}" style="cursor:pointer;" title="Ordenar por ID">ID${sortBy === 'id_asc' ? ' ▲' : (sortBy === 'id_desc' ? ' ▼' : '')}</th>
            <th class="sortable-header" data-sort-target="${sortBy === 'title_asc' ? 'title_desc' : 'title_asc'}" style="cursor:pointer;" title="Ordenar por Título">Título${sortBy === 'title_asc' ? ' ▲' : (sortBy === 'title_desc' ? ' ▼' : '')}</th>
            <th class="sortable-header" data-sort-target="${sortBy === 'author_asc' ? 'author_desc' : 'author_asc'}" style="cursor:pointer;" title="Ordenar por Autor">Autor${sortBy === 'author_asc' ? ' ▲' : (sortBy === 'author_desc' ? ' ▼' : '')}</th>
            <th class="sortable-header" data-sort-target="${sortBy === 'genre_asc' ? 'genre_desc' : 'genre_asc'}" style="cursor:pointer;" title="Ordenar por Género">Género${sortBy === 'genre_asc' ? ' ▲' : (sortBy === 'genre_desc' ? ' ▼' : '')}</th>
            <th class="sortable-header" data-sort-target="${sortBy === 'year_desc' ? 'year_asc' : 'year_desc'}" style="cursor:pointer;" title="Ordenar por Ano">Ano${sortBy === 'year_desc' ? ' ▼' : (sortBy === 'year_asc' ? ' ▲' : '')}</th>
            <th class="sortable-header" data-sort-target="${sortBy === 'isbn_asc' ? 'isbn_desc' : 'isbn_asc'}" style="cursor:pointer;" title="Ordenar por ISBN">ISBN${sortBy === 'isbn_asc' ? ' ▲' : (sortBy === 'isbn_desc' ? ' ▼' : '')}</th>
            <th class="sortable-header" data-sort-target="${sortBy === 'status_asc' ? 'status_desc' : 'status_asc'}" style="cursor:pointer;" title="Ordenar por Estado">Estado${sortBy === 'status_asc' ? ' ▲' : (sortBy === 'status_desc' ? ' ▼' : '')}</th>
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
                <td><span style="color:var(--text-muted); font-size:0.85rem;">${book.isbn || '—'}</span></td>
                <td><span class="status-tag ${statusClass}">${book.status}</span></td>
                <td style="text-align:right;">
                  <div class="action-buttons-group">
                    <button class="btn btn-secondary btn-sm btn-view-book" data-id="${book.id}" title="Ver Detalhes">👁️</button>
                    ${isLibrarian ? `
                      <button class="btn btn-secondary btn-sm btn-edit-book" data-id="${book.id}" title="Editar Livro">✏️</button>
                      <button class="btn btn-danger btn-sm btn-delete-book" data-id="${book.id}" title="Eliminar Livro">🗑️</button>
                    ` : ''}
                  </div>
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
        <div id="book-modal-error" style="display:none; padding:0.75rem; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.4); color:#ef4444; border-radius:var(--radius-md); font-size:0.85rem; font-weight:600; margin-bottom:1rem;"></div>

        <!-- Auto Lookup Box -->
        <div style="background:var(--bg-glass); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:0.85rem; margin-bottom:1rem; display:flex; flex-direction:column; gap:0.4rem;">
          <label style="font-weight:700; font-size:0.82rem; color:var(--accent-primary); display:flex; align-items:center; gap:0.4rem;">
            <span>⚡ Preenchimento Automático</span>
            <span style="font-weight:400; font-size:0.75rem; color:var(--text-muted);">(Pesquisa por ISBN, Título ou Autor)</span>
          </label>
          <div style="display:flex; gap:0.5rem;">
            <div class="form-group" style="flex:1; margin:0;">
              <input type="text" id="auto-fetch-query" value="${book ? (book.isbn || `${book.title} ${book.author}`) : ''}" placeholder="Insira o ISBN (ex: 9789722030000) ou Título/Autor...">
            </div>
            <button type="button" id="btn-auto-fetch" class="btn btn-secondary btn-sm" style="white-space:nowrap;">🔍 Pesquisar Dados</button>
          </div>
          <div id="auto-fetch-status" style="font-size:0.75rem; color:var(--text-muted); min-height:1rem;"></div>
        </div>

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

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1rem;">
          <div class="form-group">
            <label>Géneros Literários (Seleção Múltipla)</label>
            <div id="genre-chips-container" style="display:flex; flex-wrap:wrap; gap:0.4rem; padding:0.65rem; background:var(--bg-glass); border:1px solid var(--border-glass); border-radius:var(--radius-md); max-height:130px; overflow-y:auto;">
              ${genres.map(g => {
                const currentGenres = book && book.genre ? book.genre.split(',').map(x => x.trim()) : [];
                const isChecked = currentGenres.includes(g);
                return `
                  <label class="genre-chip-label" style="display:inline-flex; align-items:center; gap:0.3rem; padding:0.25rem 0.65rem; border-radius:var(--radius-full); font-size:0.8rem; cursor:pointer; user-select:none; border:1px solid ${isChecked ? 'var(--accent-primary)' : 'var(--border-glass)'}; background:${isChecked ? 'var(--accent-primary)' : 'var(--bg-card)'}; color:${isChecked ? '#ffffff' : 'var(--text-main)'}; transition:all var(--transition-fast);">
                    <input type="checkbox" class="book-genre-checkbox" value="${g}" ${isChecked ? 'checked' : ''} style="display:none;">
                    <span>${g}</span>
                  </label>
                `;
              }).join('')}
            </div>
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
        <button id="btn-save-book" class="btn btn-primary">${isEdit ? 'Guardar Alterações' : 'Adicionar à Coleção'}</button>
      </div>
    </dialog>
  `;

  const closeModal = () => portal.innerHTML = '';

  document.getElementById('btn-close-book-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-book').addEventListener('click', closeModal);
  document.getElementById('backdrop-book-modal').addEventListener('click', closeModal);

  // Prevent Form Auto-Submit on Enter inside modal
  const formBook = document.getElementById('form-book');
  if (formBook) {
    formBook.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // Auto-Fetch API Handler
  const btnAutoFetch = document.getElementById('btn-auto-fetch');
  const autoQuery = document.getElementById('auto-fetch-query');
  const autoStatus = document.getElementById('auto-fetch-status');

  if (autoQuery) {
    autoQuery.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (btnAutoFetch) btnAutoFetch.click();
      }
    });
  }

  if (btnAutoFetch) {
    btnAutoFetch.addEventListener('click', async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const query = autoQuery.value.trim();
      if (!query) {
        showToast('Por favor insira um ISBN, Título ou Autor para pesquisar', 'error');
        return;
      }

      autoStatus.textContent = '⏳ A pesquisar na base de dados global (Google Books & Open Library)...';
      btnAutoFetch.disabled = true;

      try {
        const fetchedData = await fetchGlobalBookInfo(query);

        const cleanQueryIsbn = query.replace(/[^0-9X]/gi, '');
        if (fetchedData && (fetchedData.title || fetchedData.author || fetchedData.isbn || cleanQueryIsbn)) {
          if (fetchedData.title) document.getElementById('book-title').value = fetchedData.title;
          if (fetchedData.author) document.getElementById('book-author').value = fetchedData.author;
          if (fetchedData.pubYear) document.getElementById('book-pub-year').value = fetchedData.pubYear;
          const targetIsbn = fetchedData.isbn || cleanQueryIsbn;
          if (targetIsbn) document.getElementById('book-isbn').value = targetIsbn;
          if (fetchedData.coverUrl) document.getElementById('book-cover-url').value = fetchedData.coverUrl;
          if (fetchedData.synopsis) document.getElementById('book-synopsis').value = fetchedData.synopsis;
          if (fetchedData.shelfLocation) document.getElementById('book-shelf').value = fetchedData.shelfLocation;

          // Populate genre checkboxes if genre is returned
          if (fetchedData.genre) {
            const fetchedGenres = fetchedData.genre.split(',').map(g => g.trim().toLowerCase());
            document.querySelectorAll('.book-genre-checkbox').forEach(cb => {
              const label = cb.closest('.genre-chip-label');
              if (fetchedGenres.some(fg => fg.includes(cb.value.toLowerCase()) || cb.value.toLowerCase().includes(fg))) {
                cb.checked = true;
                if (label) {
                  label.style.background = 'var(--accent-primary)';
                  label.style.color = '#ffffff';
                  label.style.borderColor = 'var(--accent-primary)';
                }
              }
            });
          }

          const displayTitle = fetchedData.title || query;
          autoStatus.innerHTML = `✅ <strong>Sucesso!</strong> Dados preenchidos para <em>"${escapeHtml(displayTitle)}"</em>. Pode rever os campos e clicar em <strong>Adicionar à Coleção</strong>.`;
          showToast('Dados do livro preenchidos! Reveja os campos e clique em Adicionar à Coleção.', 'success');
        } else {
          autoStatus.innerHTML = `❌ Nenhuma informação encontrada para "<em>${escapeHtml(query)}</em>". Tente ajustar o ISBN ou título.`;
          showToast('Nenhum resultado encontrado nas bases de dados globais.', 'info');
        }
      } catch (err) {
        console.error('Auto fetch error:', err);
        autoStatus.textContent = '❌ Erro ao ligar ao serviço de pesquisa de livros.';
        showToast('Erro de ligação ao pesquisar dados do livro.', 'error');
      } finally {
        btnAutoFetch.disabled = false;
      }
    });
  }

  // Genre Chips Toggle Handler
  document.querySelectorAll('.genre-chip-label').forEach(label => {
    const checkbox = label.querySelector('.book-genre-checkbox');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        label.style.background = 'var(--accent-primary)';
        label.style.color = '#ffffff';
        label.style.borderColor = 'var(--accent-primary)';
      } else {
        label.style.background = 'var(--bg-card)';
        label.style.color = 'var(--text-main)';
        label.style.borderColor = 'var(--border-glass)';
      }
    });
  });

  document.getElementById('btn-save-book').addEventListener('click', () => {
    const errorBanner = document.getElementById('book-modal-error');
    if (errorBanner) errorBanner.style.display = 'none';

    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();

    if (!title || !author) {
      if (errorBanner) {
        errorBanner.textContent = '⚠️ Título e Autor são campos obrigatórios.';
        errorBanner.style.display = 'block';
      }
      showToast('Título e Autor são obrigatórios', 'error');
      return;
    }

    const selectedGenres = Array.from(document.querySelectorAll('.book-genre-checkbox:checked')).map(cb => cb.value);
    const genreStr = selectedGenres.length > 0 ? selectedGenres.join(', ') : 'Geral';

    const bookData = {
      title,
      author,
      pubYear: document.getElementById('book-pub-year').value,
      genre: genreStr,
      status: document.getElementById('book-status').value,
      isbn: document.getElementById('book-isbn').value,
      shelfLocation: document.getElementById('book-shelf').value,
      coverUrl: document.getElementById('book-cover-url').value,
      synopsis: document.getElementById('book-synopsis').value
    };

    try {
      if (isEdit) {
        store.updateBook(book.id, bookData);
        showToast('Livro actualizado com sucesso!', 'success');
      } else {
        store.addBook(bookData);
        showToast('Livro adicionado à coleção!', 'success');
      }

      closeModal();
      if (onSave) onSave();
    } catch (err) {
      if (errorBanner) {
        errorBanner.textContent = err.message;
        errorBanner.style.display = 'block';
      }
      showToast(err.message, 'error');
    }
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
              <div><strong>Géneros:</strong> ${book.genre ? book.genre.split(',').map(g => `<span class="genre-tag" style="margin-right:0.25rem;">${g.trim()}</span>`).join(' ') : '<span class="genre-tag">Geral</span>'}</div>
              <div><strong>Ano de Publicação:</strong> ${book.pubYear || 'N/A'}</div>
              <div><strong>Localização:</strong> ${book.shelfLocation || 'Prateleira A1'}</div>
              ${book.isbn ? `<div><strong>ISBN:</strong> ${book.isbn}</div>` : '<div><strong>ISBN:</strong> Não especificado</div>'}
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
      <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
        ${store.getCurrentUser().role === 'librarian' ? `
          <button id="btn-refresh-book-info" class="btn btn-secondary btn-sm" title="Pesquisar capa e ISBN mais recentes nas bases de dados globais">⚡ Recarregar Capa & ISBN</button>
        ` : '<div></div>'}
        <button id="btn-close-detail-footer" class="btn btn-primary">Fechar</button>
      </div>
    </dialog>
  `;

  const closeModal = () => portal.innerHTML = '';

  document.getElementById('btn-close-detail').addEventListener('click', closeModal);
  document.getElementById('btn-close-detail-footer').addEventListener('click', closeModal);
  document.getElementById('backdrop-detail-modal').addEventListener('click', closeModal);

  const btnRefreshInfo = document.getElementById('btn-refresh-book-info');
  if (btnRefreshInfo) {
    btnRefreshInfo.addEventListener('click', async () => {
      showToast(`A pesquisar a capa, ISBN e dados mais recentes para "${book.title}"...`, 'info');
      btnRefreshInfo.disabled = true;

      try {
        const query = book.isbn || `${book.title} ${book.author}`;
        const fetchedData = await fetchGlobalBookInfo(query);

        if (fetchedData && (fetchedData.coverUrl || fetchedData.synopsis || fetchedData.isbn)) {
          const updatedFields = {};
          if (fetchedData.coverUrl) updatedFields.coverUrl = fetchedData.coverUrl;
          if (fetchedData.synopsis) updatedFields.synopsis = fetchedData.synopsis;
          if (fetchedData.isbn) updatedFields.isbn = fetchedData.isbn; // Always update ISBN!
          if (fetchedData.pubYear) updatedFields.pubYear = fetchedData.pubYear;

          store.updateBook(book.id, updatedFields);
          const updatedBook = store.getBookById(book.id);
          showToast('Capa, ISBN e detalhes do livro recarregados com sucesso!', 'success');
          openBookDetailModal(updatedBook);
        } else {
          showToast('Não foram encontradas novas imagens de capa ou dados adicionais.', 'info');
        }
      } catch (err) {
        console.error('Refresh book info error:', err);
        showToast('Erro ao recarregar dados do livro.', 'error');
      } finally {
        if (btnRefreshInfo) btnRefreshInfo.disabled = false;
      }
    });
  }
}

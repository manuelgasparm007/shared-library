import initialData from './initialData.json';

const STORAGE_KEYS = {
  BOOKS: 'shared_library_books',
  MEMBERS: 'shared_library_members',
  LOANS: 'shared_library_loans',
  GENRES: 'shared_library_genres',
  STATUSES: 'shared_library_statuses',
  USER: 'shared_library_current_user',
  CLOUD_CONFIG: 'shared_library_cloud_config'
};

class LibraryStore extends EventTarget {
  constructor() {
    super();
    this.initStore();
  }

  initStore() {
    // 1. Load or Seed Books
    if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
      const formattedBooks = (initialData.Biblioteca || []).map(b => ({
        id: b["ID do Livro"],
        title: b["Título"],
        author: b["Autor"],
        genre: b["Género"],
        pubYear: b["Ano de Publicação"],
        status: b["Estado"] || "Disponível",
        coverUrl: b["CoverUrl"] || "",
        isbn: b["ISBN"] || "",
        publisher: b["Publisher"] || "",
        synopsis: b["Synopsis"] || "",
        shelfLocation: b["ShelfLocation"] || "A-1"
      }));
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(formattedBooks));
    }

    // 2. Load or Seed Members
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      const formattedMembers = (initialData.Membros || []).map(m => ({
        id: m["ID Membro"],
        fullName: m["Nome Completo"],
        email: m["Endereço de Email"],
        phone: m["Número de Telefone"],
        joinedDate: m["Data de Inscrição"] || new Date().toISOString().split('T')[0],
        role: m["Role"] || "patron"
      }));

      // Add default librarian user if not present
      if (!formattedMembers.some(m => m.role === 'librarian')) {
        formattedMembers.push({
          id: 'M000',
          fullName: 'Bibliotecário Principal',
          email: 'admin@biblioteca.pt',
          phone: '+351 900 000 000',
          joinedDate: new Date().toISOString().split('T')[0],
          role: 'librarian'
        });
      }
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(formattedMembers));
    }

    // 3. Load or Seed Loans
    if (!localStorage.getItem(STORAGE_KEYS.LOANS)) {
      const formattedLoans = (initialData["Empréstimos"] || []).map(l => ({
        id: l["ID Transação"],
        bookId: l["ID do Livro"],
        memberName: l["Nome do Requisitante"],
        checkoutDate: l["Data de Empréstimo"],
        dueDate: l["Data Limite"],
        status: l["Estado"],
        returnDate: l["Data de Devolução"] !== '-' ? l["Data de Devolução"] : null
      }));
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(formattedLoans));
    }

    // 4. Load Genres & Statuses
    if (!localStorage.getItem(STORAGE_KEYS.GENRES)) {
      const genres = (initialData._lista_generos || []).map(g => g["Géneros"]);
      localStorage.setItem(STORAGE_KEYS.GENRES, JSON.stringify(genres));
    }

    if (!localStorage.getItem(STORAGE_KEYS.STATUSES)) {
      const statuses = (initialData._lista_estados || []).map(s => s["Estados"]);
      localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(statuses));
    }

    // 5. Default Session User
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      this.setCurrentUser({
        name: 'Bibliotecário Principal',
        email: 'admin@biblioteca.pt',
        role: 'librarian'
      });
    }
  }

  notifyChange() {
    this.dispatchEvent(new CustomEvent('store-change'));
  }

  // --- Auth Session Methods ---
  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || {
      name: 'Bibliotecário Principal',
      email: 'admin@biblioteca.pt',
      role: 'librarian'
    };
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.notifyChange();
  }

  login(email, role = 'patron', name = '') {
    const members = this.getMembers();
    const existing = members.find(m => m.email.toLowerCase() === email.toLowerCase());

    let userObj;
    if (existing) {
      userObj = {
        name: existing.fullName,
        email: existing.email,
        role: existing.role || role,
        id: existing.id
      };
    } else {
      userObj = {
        name: name || (role === 'librarian' ? 'Bibliotecário' : email.split('@')[0]),
        email: email,
        role: role,
        id: role === 'librarian' ? 'ADMIN' : 'M' + String(members.length + 1).padStart(3, '0')
      };
    }

    this.setCurrentUser(userObj);
    return userObj;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.notifyChange();
  }

  // --- Books Methods ---
  getBooks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKS)) || [];
  }

  getBookById(id) {
    return this.getBooks().find(b => b.id === id);
  }

  addBook(bookData) {
    const books = this.getBooks();
    const newId = bookData.id || `B${String(books.length + 1).padStart(3, '0')}`;
    const newBook = {
      id: newId,
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      genre: bookData.genre || 'Ficção',
      pubYear: parseInt(bookData.pubYear) || new Date().getFullYear(),
      status: bookData.status || 'Disponível',
      coverUrl: bookData.coverUrl || '',
      isbn: bookData.isbn || '',
      publisher: bookData.publisher || '',
      synopsis: bookData.synopsis || '',
      shelfLocation: bookData.shelfLocation || 'Prateleira A1'
    };

    books.push(newBook);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    this.notifyChange();
    return newBook;
  }

  updateBook(id, updatedFields) {
    let books = this.getBooks();
    books = books.map(b => b.id === id ? { ...b, ...updatedFields } : b);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    this.notifyChange();
  }

  deleteBook(id) {
    let books = this.getBooks();
    books = books.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    this.notifyChange();
  }

  // --- Members Methods ---
  getMembers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS)) || [];
  }

  addMember(memberData) {
    const members = this.getMembers();
    const newId = `M${String(members.length + 1).padStart(3, '0')}`;
    const newMember = {
      id: newId,
      fullName: memberData.fullName.trim(),
      email: memberData.email.trim(),
      phone: memberData.phone.trim(),
      joinedDate: new Date().toISOString().split('T')[0],
      role: memberData.role || 'patron'
    };
    members.push(newMember);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notifyChange();
    return newMember;
  }

  updateMember(id, updatedFields) {
    let members = this.getMembers();
    members = members.map(m => m.id === id ? { ...m, ...updatedFields } : m);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notifyChange();
  }

  deleteMember(id) {
    let members = this.getMembers();
    members = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notifyChange();
  }

  // --- Loans Methods ---
  getLoans() {
    const loans = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOANS)) || [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Recalculate overdue statuses dynamically
    return loans.map(loan => {
      if (loan.status === 'Emprestado' && loan.dueDate < todayStr) {
        return { ...loan, isOverdue: true };
      }
      return { ...loan, isOverdue: false };
    });
  }

  checkoutBook({ bookId, memberName, memberEmail, dueDays = 14, customDueDate = null }) {
    const book = this.getBookById(bookId);
    if (!book) throw new Error('Livro não encontrado');
    if (book.status !== 'Disponível') throw new Error('Livro não está disponível para empréstimo');

    const loans = this.getLoans();
    const newId = `T${String(loans.length + 1).padStart(3, '0')}`;
    const today = new Date();

    let dueDateStr;
    if (customDueDate) {
      dueDateStr = customDueDate;
    } else {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + parseInt(dueDays));
      dueDateStr = targetDate.toISOString().split('T')[0];
    }

    const newLoan = {
      id: newId,
      bookId: bookId,
      memberName: memberName,
      memberEmail: memberEmail || '',
      checkoutDate: today.toISOString().split('T')[0],
      dueDate: dueDateStr,
      status: 'Emprestado',
      returnDate: null
    };

    loans.push(newLoan);
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));

    // Update book status
    this.updateBook(bookId, { status: 'Emprestado' });
    this.notifyChange();
    return newLoan;
  }

  returnBook(loanId) {
    let loans = this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Empréstimo não encontrado');

    const todayStr = new Date().toISOString().split('T')[0];
    loans = loans.map(l => l.id === loanId ? { ...l, status: 'Devolvido', returnDate: todayStr } : l);
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));

    // Update book status back to Disponível
    if (loan.bookId) {
      this.updateBook(loan.bookId, { status: 'Disponível' });
    }
    this.notifyChange();
  }

  renewLoan(loanId, extraDays = 14) {
    let loans = this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Empréstimo não encontrado');

    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + parseInt(extraDays));
    const newDueDateStr = currentDue.toISOString().split('T')[0];

    loans = loans.map(l => l.id === loanId ? { ...l, dueDate: newDueDateStr, status: 'Emprestado' } : l);
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    this.notifyChange();
  }

  // --- Genres & Statuses ---
  getGenres() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GENRES)) || [];
  }

  addGenre(newGenre) {
    const genres = this.getGenres();
    if (!genres.includes(newGenre)) {
      genres.push(newGenre);
      localStorage.setItem(STORAGE_KEYS.GENRES, JSON.stringify(genres));
      this.notifyChange();
    }
  }

  getStatuses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATUSES)) || [];
  }

  // --- Backup & Seed Management ---
  exportBackup() {
    const data = {
      books: this.getBooks(),
      members: this.getMembers(),
      loans: this.getLoans(),
      genres: this.getGenres(),
      statuses: this.getStatuses(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblioteca_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.books) localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(data.books));
      if (data.members) localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
      if (data.loans) localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(data.loans));
      if (data.genres) localStorage.setItem(STORAGE_KEYS.GENRES, JSON.stringify(data.genres));
      if (data.statuses) localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(data.statuses));
      this.notifyChange();
      return true;
    } catch (e) {
      console.error('Import error:', e);
      throw new Error('Ficheiro de cópia de segurança inválido');
    }
  }

  resetToSeedData() {
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.GENRES);
    localStorage.removeItem(STORAGE_KEYS.STATUSES);
    this.initStore();
    this.notifyChange();
  }

  // --- Cloud Config ---
  getCloudConfig() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLOUD_CONFIG)) || { url: '', key: '' };
  }

  setCloudConfig(url, key) {
    localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify({ url, key }));
    this.notifyChange();
  }
}

export const store = new LibraryStore();

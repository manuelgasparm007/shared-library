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

      if (!formattedMembers.some(m => m.role === 'librarian')) {
        formattedMembers.push({
          id: 'M000',
          fullName: 'Bibliotecário Principal',
          email: 'admin@camomila.pt',
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

    // 5. Attempt Cloud Sync if credentials are configured
    const cloud = this.getCloudConfig();
    if (cloud.url && cloud.key) {
      this.fetchFromCloud().catch(err => console.warn('Cloud sync error on init:', err));
    }
  }

  notifyChange() {
    this.dispatchEvent(new CustomEvent('store-change'));
  }

  // --- Auth Session Methods ---
  getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    this.notifyChange();
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.clear();
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    this.notifyChange();
  }

  login(email) {
    const members = this.getMembers();
    const cleanEmail = email.trim().toLowerCase();
    const existing = members.find(m => m.email.toLowerCase() === cleanEmail);

    if (!existing) {
      throw new Error('Endereço de email não encontrado no registo. Por favor crie uma conta.');
    }

    if (existing.status === 'pending') {
      throw new Error('A sua conta foi registada, mas ainda se encontra A AGUARDAR APROVAÇÃO pelo Bibliotecário.');
    }

    const userObj = {
      name: existing.fullName,
      email: existing.email,
      role: existing.role || 'patron',
      id: existing.id
    };

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

    // Async sync to cloud
    this.syncBookToCloud(newBook);

    return newBook;
  }

  updateBook(id, updatedFields) {
    let books = this.getBooks();
    const targetBook = books.find(b => b.id === id);
    if (!targetBook) return;

    const updatedBook = { ...targetBook, ...updatedFields };
    books = books.map(b => b.id === id ? updatedBook : b);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    this.notifyChange();

    // Async sync to cloud
    this.syncBookToCloud(updatedBook);
  }

  deleteBook(id) {
    let books = this.getBooks();
    books = books.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    this.notifyChange();

    // Async delete from cloud
    this.deleteBookFromCloud(id);
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
      phone: memberData.phone ? memberData.phone.trim() : '',
      joinedDate: new Date().toISOString().split('T')[0],
      role: memberData.role || 'patron',
      status: memberData.status || 'approved'
    };
    members.push(newMember);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notifyChange();

    // Async sync to cloud
    this.syncMemberToCloud(newMember);

    return newMember;
  }

  registerNewUser(userData) {
    const members = this.getMembers();
    const existing = members.find(m => m.email.toLowerCase() === userData.email.trim().toLowerCase());

    if (existing) {
      throw new Error('Já existe uma conta registada com este endereço de email.');
    }

    return this.addMember({
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone || '',
      role: 'patron',
      status: 'pending' // Requires admin approval!
    });
  }

  approveMember(id) {
    const member = this.getMembers().find(m => m.id === id);
    if (!member) throw new Error('Membro não encontrado');

    this.updateMember(id, { status: 'approved' });
  }

  updateMember(id, updatedFields) {
    let members = this.getMembers();
    const targetMember = members.find(m => m.id === id);
    if (!targetMember) return;

    const updatedMember = { ...targetMember, ...updatedFields };
    members = members.map(m => m.id === id ? updatedMember : m);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notifyChange();

    // Async sync to cloud
    this.syncMemberToCloud(updatedMember);
  }

  deleteMember(id) {
    let members = this.getMembers();
    members = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notifyChange();

    // Async delete from cloud
    this.deleteMemberFromCloud(id);
  }

  // --- Loans Methods ---
  getLoans() {
    const loans = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOANS)) || [];
    const todayStr = new Date().toISOString().split('T')[0];

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

    // Async sync loan to cloud
    this.syncLoanToCloud(newLoan);

    return newLoan;
  }

  returnBook(loanId) {
    let loans = this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Empréstimo não encontrado');

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedLoan = { ...loan, status: 'Devolvido', returnDate: todayStr };
    loans = loans.map(l => l.id === loanId ? updatedLoan : l);
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));

    if (loan.bookId) {
      this.updateBook(loan.bookId, { status: 'Disponível' });
    }
    this.notifyChange();

    // Async sync loan to cloud
    this.syncLoanToCloud(updatedLoan);
  }

  renewLoan(loanId, extraDays = 14) {
    let loans = this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Empréstimo não encontrado');

    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + parseInt(extraDays));
    const newDueDateStr = currentDue.toISOString().split('T')[0];

    const updatedLoan = { ...loan, dueDate: newDueDateStr, status: 'Emprestado' };
    loans = loans.map(l => l.id === loanId ? updatedLoan : l);
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    this.notifyChange();

    // Async sync loan to cloud
    this.syncLoanToCloud(updatedLoan);
  }

  // --- Genres & Statuses ---
  getGenres() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GENRES)) || [];
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
    a.download = `bibliotecacamomila_backup_${new Date().toISOString().split('T')[0]}.json`;
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

  // --- Supabase Cloud REST Sync ---
  getCloudConfig() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLOUD_CONFIG)) || { url: '', key: '' };
  }

  setCloudConfig(url, key) {
    localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify({ url: url.trim(), key: key.trim() }));
    this.notifyChange();
  }

  async syncBookToCloud(book) {
    const { url, key } = this.getCloudConfig();
    if (!url || !key) return;

    const dbBook = {
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre || 'Ficção',
      pub_year: parseInt(book.pubYear) || null,
      status: book.status || 'Disponível',
      cover_url: book.coverUrl || null,
      isbn: book.isbn || null,
      publisher: book.publisher || null,
      synopsis: book.synopsis || null,
      shelf_location: book.shelfLocation || null
    };

    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/books`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(dbBook)
      });
      if (!res.ok) console.warn('Supabase book sync status:', res.status, res.statusText);
    } catch (e) {
      console.error('Supabase book sync error:', e);
    }
  }

  async deleteBookFromCloud(id) {
    const { url, key } = this.getCloudConfig();
    if (!url || !key) return;

    try {
      await fetch(`${url.replace(/\/$/, '')}/rest/v1/books?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
    } catch (e) {
      console.error('Supabase book delete error:', e);
    }
  }

  async syncMemberToCloud(member) {
    const { url, key } = this.getCloudConfig();
    if (!url || !key) return;

    const dbMember = {
      id: member.id,
      full_name: member.fullName,
      email: member.email,
      phone: member.phone || null,
      joined_date: member.joinedDate || new Date().toISOString().split('T')[0],
      role: member.role || 'patron'
    };

    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/members`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(dbMember)
      });
      if (!res.ok) console.warn('Supabase member sync status:', res.status);
    } catch (e) {
      console.error('Supabase member sync error:', e);
    }
  }

  async deleteMemberFromCloud(id) {
    const { url, key } = this.getCloudConfig();
    if (!url || !key) return;

    try {
      await fetch(`${url.replace(/\/$/, '')}/rest/v1/members?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
    } catch (e) {
      console.error('Supabase member delete error:', e);
    }
  }

  async syncLoanToCloud(loan) {
    const { url, key } = this.getCloudConfig();
    if (!url || !key) return;

    const dbLoan = {
      id: loan.id,
      book_id: loan.bookId,
      member_name: loan.memberName,
      member_email: loan.memberEmail || null,
      checkout_date: loan.checkoutDate,
      due_date: loan.dueDate,
      status: loan.status,
      return_date: loan.returnDate || null
    };

    try {
      const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/loans`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(dbLoan)
      });
      if (!res.ok) console.warn('Supabase loan sync status:', res.status);
    } catch (e) {
      console.error('Supabase loan sync error:', e);
    }
  }

  async syncAllToCloud() {
    const { url, key } = this.getCloudConfig();
    if (!url || !key) throw new Error('Por favor configure o URL e a Anon Key do Supabase primeiro');

    // Sync all books
    const books = this.getBooks();
    for (const b of books) {
      await this.syncBookToCloud(b);
    }

    // Sync all members
    const members = this.getMembers();
    for (const m of members) {
      await this.syncMemberToCloud(m);
    }

    // Sync all loans
    const loans = this.getLoans();
    for (const l of loans) {
      await this.syncLoanToCloud(l);
    }

    return true;
  }

  async fetchFromCloud() {
    const { url, key } = this.getCloudConfig();
    if (!url || !key) return;

    try {
      // Fetch books
      const bRes = await fetch(`${url.replace(/\/$/, '')}/rest/v1/books?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      if (bRes.ok) {
        const cloudBooks = await bRes.json();
        if (cloudBooks && cloudBooks.length > 0) {
          const formatted = cloudBooks.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author,
            genre: b.genre,
            pubYear: b.pub_year,
            status: b.status,
            coverUrl: b.cover_url || '',
            isbn: b.isbn || '',
            publisher: b.publisher || '',
            synopsis: b.synopsis || '',
            shelfLocation: b.shelf_location || 'A-1'
          }));
          localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(formatted));
        }
      }

      // Fetch members
      const mRes = await fetch(`${url.replace(/\/$/, '')}/rest/v1/members?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      if (mRes.ok) {
        const cloudMembers = await mRes.json();
        if (cloudMembers && cloudMembers.length > 0) {
          const formatted = cloudMembers.map(m => ({
            id: m.id,
            fullName: m.full_name,
            email: m.email,
            phone: m.phone || '',
            joinedDate: m.joined_date,
            role: m.role || 'patron'
          }));
          localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(formatted));
        }
      }

      // Fetch loans
      const lRes = await fetch(`${url.replace(/\/$/, '')}/rest/v1/loans?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      });
      if (lRes.ok) {
        const cloudLoans = await lRes.json();
        if (cloudLoans && cloudLoans.length > 0) {
          const formatted = cloudLoans.map(l => ({
            id: l.id,
            bookId: l.book_id,
            memberName: l.member_name,
            memberEmail: l.member_email || '',
            checkoutDate: l.checkout_date,
            dueDate: l.due_date,
            status: l.status,
            returnDate: l.return_date
          }));
          localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(formatted));
        }
      }

      this.notifyChange();
    } catch (e) {
      console.error('Fetch from cloud error:', e);
    }
  }
}

export const store = new LibraryStore();

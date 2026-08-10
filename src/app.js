import { store } from './data/store.js';
import { renderAuthModal } from './components/auth.js';
import { renderDashboard } from './components/dashboard.js';
import { renderCatalog } from './components/catalog.js';
import { renderMembers } from './components/members.js';
import { renderLoans } from './components/loans.js';
import { renderSettings } from './components/settings.js';
import { showToast } from './components/toast.js';

let currentView = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const currentUser = store.getCurrentUser();
  updateUserUI(currentUser);

  // Setup View Router Navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = e.currentTarget.dataset.view;
      switchView(targetView);
    });
  });

  // Global Search Input
  const globalSearch = document.getElementById('global-search-input');
  globalSearch.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val && currentView !== 'catalog') {
      switchView('catalog');
    }
  });

  // Theme Toggle
  const themeBtn = document.getElementById('btn-theme-toggle');
  let currentTheme = localStorage.getItem('library_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('library_theme', currentTheme);
    showToast(`Tema ${currentTheme === 'dark' ? 'Escuro' : 'Claro'} activado`, 'info');
  });

  // Logout Click Listener
  document.getElementById('btn-logout').addEventListener('click', (e) => {
    e.stopPropagation();
    store.logout();
    openAuthDialog();
  });

  document.getElementById('user-profile-btn').addEventListener('click', () => {
    openAuthDialog();
  });

  // Listen to store updates
  store.addEventListener('store-change', () => {
    const user = store.getCurrentUser();
    updateUserUI(user);
    renderCurrentView();
  });

  // Render Initial View
  renderCurrentView();
}

function updateUserUI(user) {
  const badgeLabel = document.getElementById('role-badge-label');
  const badgeIcon = document.getElementById('role-badge-icon');
  const roleBadge = document.getElementById('user-role-badge');
  const nameDisplay = document.getElementById('user-name-display');
  const avatar = document.getElementById('user-avatar');

  if (user) {
    nameDisplay.textContent = user.name;
    avatar.textContent = user.name.charAt(0).toUpperCase();

    if (user.role === 'librarian') {
      badgeLabel.textContent = 'Bibliotecário';
      badgeIcon.textContent = '👑';
      roleBadge.className = 'role-badge';
    } else {
      badgeLabel.textContent = 'Leitor';
      badgeIcon.textContent = '👤';
      roleBadge.className = 'role-badge patron';
    }
  }
}

function switchView(viewName) {
  currentView = viewName;
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  renderCurrentView();
}

function renderCurrentView() {
  const viewport = document.getElementById('content-viewport');
  if (!viewport) return;

  switch (currentView) {
    case 'dashboard':
      renderDashboard(viewport);
      break;
    case 'catalog':
      renderCatalog(viewport);
      break;
    case 'members':
      renderMembers(viewport);
      break;
    case 'loans':
      renderLoans(viewport);
      break;
    case 'settings':
      renderSettings(viewport);
      break;
    default:
      renderDashboard(viewport);
  }
}

function openAuthDialog() {
  const portal = document.getElementById('auth-portal');
  renderAuthModal(portal, (user) => {
    portal.innerHTML = '';
    updateUserUI(user);
    renderCurrentView();
  });
}

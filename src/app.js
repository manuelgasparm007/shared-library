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
  
  // Mobile Sidebar Drawer Setup
  setupMobileDrawer();

  // Setup View Router Navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = e.currentTarget.dataset.view;
      switchView(targetView);
      closeMobileDrawer();
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

  // Theme Selector Setup (5 Curated Themes)
  const themeSelector = document.getElementById('theme-selector');
  let currentTheme = localStorage.getItem('library_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  if (themeSelector) {
    themeSelector.value = currentTheme;
    themeSelector.addEventListener('change', (e) => {
      currentTheme = e.target.value;
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('library_theme', currentTheme);

      const themeNames = {
        dark: '🌙 Escuro (Midnight)',
        light: '☀️ Claro (Nórdico)',
        camomila: '🌿 Camomila (Verde)',
        parchment: '📜 Pergaminho (Sépia)',
        violet: '💜 Violeta (Cyber)'
      };

      showToast(`Tema ${themeNames[currentTheme] || currentTheme} activado`, 'info');
    });
  }

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

  updateUserUI(currentUser);
  renderCurrentView();
}

function setupMobileDrawer() {
  const mobileToggle = document.getElementById('btn-mobile-toggle');
  const sidebar = document.querySelector('.sidebar');

  let backdrop = document.getElementById('sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active');
    });
  }

  backdrop.addEventListener('click', closeMobileDrawer);
}

function closeMobileDrawer() {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
}

function updateUserUI(user) {
  const badgeLabel = document.getElementById('role-badge-label');
  const badgeIcon = document.getElementById('role-badge-icon');
  const roleBadge = document.getElementById('user-role-badge');
  const nameDisplay = document.getElementById('user-name-display');
  const avatar = document.getElementById('user-avatar');

  if (!user) return;

  nameDisplay.textContent = user.name;
  avatar.textContent = user.name.charAt(0).toUpperCase();

  const isLibrarian = user.role === 'librarian';

  if (isLibrarian) {
    badgeLabel.textContent = 'Bibliotecário';
    badgeIcon.textContent = '👑';
    roleBadge.className = 'role-badge';
  } else {
    badgeLabel.textContent = 'Leitor';
    badgeIcon.textContent = '👤';
    roleBadge.className = 'role-badge patron';
  }

  // Filter navigation bar items based on user role
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const view = item.dataset.view;
    if (!isLibrarian) {
      // Patron view: only show catalog & loans (My Loans)
      if (view === 'catalog' || view === 'loans') {
        item.style.display = 'flex';
        if (view === 'loans') {
          item.innerHTML = '<span>🔄</span> Os Meus Empréstimos';
        }
      } else {
        item.style.display = 'none';
      }
    } else {
      // Librarian view: show all items
      item.style.display = 'flex';
      if (view === 'loans') {
        item.innerHTML = '<span>🔄</span> Empréstimos';
      }
    }
  });

  // If Patron attempts to view admin-only pages, redirect to catalog
  if (!isLibrarian && (currentView === 'dashboard' || currentView === 'members' || currentView === 'settings')) {
    switchView('catalog');
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
      renderCatalog(viewport);
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

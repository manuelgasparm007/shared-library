import { store } from './data/store.js';
import { renderLandingAuth } from './components/auth.js';
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

  // Initialize active theme
  const currentTheme = localStorage.getItem('library_theme') || 'parchment';
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Logout Click Listener
  document.getElementById('btn-logout').addEventListener('click', (e) => {
    e.stopPropagation();
    store.logout();
    checkAuthState();
  });

  document.getElementById('user-profile-btn').addEventListener('click', () => {
    store.logout();
    checkAuthState();
  });

  // Listen to store updates
  store.addEventListener('store-change', () => {
    checkAuthState();
  });

  // Check initial authentication state
  checkAuthState();
}

function checkAuthState() {
  const currentUser = store.getCurrentUser();
  const appShell = document.getElementById('app');
  const authPortal = document.getElementById('auth-portal');

  if (!currentUser) {
    if (appShell) appShell.style.display = 'none';
    renderLandingAuth(authPortal, (user) => {
      authPortal.innerHTML = '';
      if (appShell) appShell.style.display = 'flex';
      updateUserUI(user);
      renderCurrentView();
    });
  } else {
    authPortal.innerHTML = '';
    if (appShell) appShell.style.display = 'flex';
    updateUserUI(currentUser);
    renderCurrentView();
  }
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
  const nameDisplay = document.getElementById('user-name-display');
  const avatar = document.getElementById('user-avatar');

  if (!user) return;

  nameDisplay.textContent = user.name;
  avatar.textContent = user.name.charAt(0).toUpperCase();

  const isLibrarian = user.role === 'librarian';

  // Filter navigation bar items based on user role
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const view = item.dataset.view;
    if (!isLibrarian) {
      // Patron view: show catalog, loans (Os Meus Empréstimos), AND settings (Definições)
      if (view === 'catalog' || view === 'loans' || view === 'settings') {
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
  if (!isLibrarian && (currentView === 'dashboard' || currentView === 'members')) {
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

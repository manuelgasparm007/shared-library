import { store } from './data/store.js';
import { renderLandingAuth } from './components/auth.js';
import { renderDashboard } from './components/dashboard.js';
import { renderCatalog, resetCatalogFilters, setCatalogSearchQuery } from './components/catalog.js';
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
      if (targetView === 'catalog') {
        resetCatalogFilters();
      }
      switchView(targetView);
      closeMobileDrawer();
    });
  });

  // Global Search Input
  const globalSearch = document.getElementById('global-search-input');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      setCatalogSearchQuery(val);
      if (val && currentView !== 'catalog') {
        switchView('catalog');
      } else if (currentView === 'catalog') {
        const viewport = document.getElementById('content-viewport');
        if (viewport) renderCatalog(viewport);
      }
    });
  }

  // Initialize active theme (Default to Official Camomila Theme)
  const currentTheme = localStorage.getItem('library_theme') || 'camomila';
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Global Logout Click Delegation for all users (Patron and Librarian)
  document.addEventListener('click', (e) => {
    const logoutTarget = e.target.closest('#btn-logout, #user-profile-btn, #btn-settings-logout, .btn-do-logout');
    if (logoutTarget) {
      e.preventDefault();
      e.stopPropagation();
      store.logout();
      showToast('Sessão terminada com sucesso.', 'info');
    }
  });

  // Listen to browser URL hash changes
  window.addEventListener('hashchange', () => {
    const hashView = (window.location.hash || '').replace('#', '').trim();
    if (hashView && hashView !== currentView) {
      switchView(hashView);
    }
  });

  // Listen to store updates
  store.addEventListener('store-change', () => {
    checkAuthState(false);
  });

  // Check initial authentication state
  checkAuthState(true);
}

let currentSessionEmail = null;

function checkAuthState(isInitial = false) {
  const currentUser = store.getCurrentUser();
  const appShell = document.getElementById('app');
  const authPortal = document.getElementById('auth-portal');

  if (!currentUser) {
    currentSessionEmail = null;
    if (appShell) appShell.style.display = 'none';
    if (authPortal) authPortal.style.display = 'block';
    renderLandingAuth(authPortal, (user) => {
      currentSessionEmail = user ? user.email : null;
      authPortal.innerHTML = '';
      if (authPortal) authPortal.style.display = 'none';
      if (appShell) appShell.style.display = 'flex';
      const targetDefaultView = user.role === 'librarian' ? 'dashboard' : 'catalog';
      updateUserUI(user);
      switchView(targetDefaultView);
    });
  } else {
    authPortal.innerHTML = '';
    if (authPortal) authPortal.style.display = 'none';
    if (appShell) appShell.style.display = 'flex';
    updateUserUI(currentUser);

    // Only switch view on initial app load or when switching user sessions
    if (isInitial || !currentSessionEmail || currentSessionEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      currentSessionEmail = currentUser.email;
      const savedHash = (window.location.hash || '').replace('#', '').trim();
      const savedView = savedHash || localStorage.getItem('active_library_view');
      const defaultRoleView = currentUser.role === 'librarian' ? 'dashboard' : 'catalog';
      let targetView = savedView || defaultRoleView;

      if (currentUser.role !== 'librarian' && (targetView === 'dashboard' || targetView === 'members')) {
        targetView = 'catalog';
      }

      switchView(targetView);
    }
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
    const isMobileItem = item.classList.contains('mobile-nav-item');

    if (!isLibrarian) {
      // Patron view: show catalog, loans (Os Meus Empréstimos), AND settings (Definições)
      if (view === 'catalog' || view === 'loans' || view === 'settings') {
        item.style.display = 'flex';
        if (view === 'loans') {
          if (isMobileItem) {
            const label = item.querySelector('.nav-label');
            if (label) label.textContent = 'Os Meus';
          } else {
            item.innerHTML = '<span>🔄</span> Os Meus Empréstimos';
          }
        }
      } else {
        item.style.display = 'none';
      }
    } else {
      // Librarian view: show all items
      item.style.display = 'flex';
      if (view === 'loans') {
        if (isMobileItem) {
          const label = item.querySelector('.nav-label');
          if (label) label.textContent = 'Empréstimos';
        } else {
          item.innerHTML = '<span>🔄</span> Empréstimos';
        }
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
  localStorage.setItem('active_library_view', viewName);
  if (window.location.hash !== '#' + viewName) {
    window.location.hash = viewName;
  }

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

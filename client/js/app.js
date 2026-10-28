// API Base URL - since we serve frontend statically from the backend, we use relative paths.
// This prevents hardcoding localhost ports and works automatically on local or production servers.
const API_BASE_URL = '/api';

// Helper to get authorization headers containing JWT
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Authentication check utilities
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

// Global logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showAlert('You have logged out successfully!', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Global alert utility (injects a temporary Bootstrap alert at the top of the page)
function showAlert(message, type = 'success') {
  // Check if alert container exists, otherwise create it
  let alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.right = '20px';
    alertContainer.style.zIndex = '9999';
    alertContainer.style.minWidth = '300px';
    document.body.appendChild(alertContainer);
  }

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alertContainer.appendChild(alertDiv);

  // Auto remove alert after 3 seconds
  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
    bsAlert.close();
  }, 3000);
}

// Render dynamic navbar based on user session status and role
function renderNavbar() {
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (!navbarPlaceholder) return;

  const loggedIn = isLoggedIn();
  const adminUser = isAdmin();
  const currentUser = getUser();

  let navLinksLeft = `
    <li class="nav-item">
      <a class="nav-link" href="products.html">Browse Products</a>
    </li>
  `;

  let navLinksRight = '';

  if (loggedIn) {
    // Links for logged in users
    navLinksLeft += `
      <li class="nav-item">
        <a class="nav-link" href="orders.html">My Orders</a>
      </li>
    `;

    if (adminUser) {
      // Additional links for admin
      navLinksLeft += `
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle text-warning" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Admin Panel
          </a>
          <ul class="dropdown-menu" aria-labelledby="adminDropdown">
            <li><a class="dropdown-item" href="admin-dashboard.html">Dashboard</a></li>
            <li><a class="dropdown-item" href="admin-products.html">Manage Products</a></li>
            <li><a class="dropdown-item" href="admin-orders.html">Manage Orders</a></li>
          </ul>
        </li>
      `;
    }

    navLinksRight = `
      <li class="nav-item me-3">
        <a class="nav-link position-relative" href="cart.html">
          <i class="bi bi-cart3"></i> Cart
          <span id="cart-badge" class="badge rounded-pill bg-danger d-none">0</span>
        </a>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Hi, ${currentUser ? currentUser.name : 'User'} ${adminUser ? '<span class="badge bg-warning text-dark">Admin</span>' : ''}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><button class="dropdown-item" onclick="logout()">Logout</button></li>
        </ul>
      </li>
    `;
  } else {
    // Links for guests
    navLinksRight = `
      <li class="nav-item me-2">
        <a class="btn btn-outline-light btn-sm px-3 mt-1" href="login.html">Login</a>
      </li>
      <li class="nav-item">
        <a class="btn btn-warning btn-sm px-3 mt-1 text-dark" href="register.html">Register</a>
      </li>
    `;
  }

  navbarPlaceholder.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold text-uppercase d-flex align-items-center" href="index.html">
          <span class="fs-4 me-2">🛒</span> StudentShop
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${navLinksLeft}
          </ul>
          
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center-lg">
            ${navLinksRight}
            <!-- Dark Mode Toggle -->
            <li class="nav-item ms-lg-3">
              <button id="theme-toggle" class="btn btn-sm btn-outline-secondary text-light border-0" onclick="toggleDarkMode()" title="Toggle Dark Mode">
                <i id="theme-icon" class="bi bi-moon-fill"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `;

  // Apply dark mode immediately on render
  applyDarkModeTheme();
  
  // Refresh cart badge count
  updateCartBadge();
}

// Refresh the cart badge count in the navbar
async function updateCartBadge() {
  if (!isLoggedIn()) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const cart = await response.json();
      const badge = document.getElementById('cart-badge');
      if (badge) {
        // Sum total quantities of all items
        const totalItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        if (totalItemsCount > 0) {
          badge.textContent = totalItemsCount;
          badge.classList.remove('d-none');
        } else {
          badge.classList.add('d-none');
        }
      }
    }
  } catch (error) {
    console.error('Error updating cart badge:', error);
  }
}

// Dark Mode Toggle Logic
function toggleDarkMode() {
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    localStorage.setItem('theme', 'light');
  } else {
    localStorage.setItem('theme', 'dark');
  }
  applyDarkModeTheme();
}

function applyDarkModeTheme() {
  const currentTheme = localStorage.getItem('theme');
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  
  if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    if (themeIcon) {
      themeIcon.className = 'bi bi-sun-fill text-warning';
    }
  } else {
    body.classList.remove('dark-mode');
    if (themeIcon) {
      themeIcon.className = 'bi bi-moon-fill text-light';
    }
  }
}

// Run navbar rendering automatically when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
});

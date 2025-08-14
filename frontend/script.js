// ===================================
// Configuration & Constants
// ===================================
const API_BASE_URL = 'http://127.0.0.1:3000/api/v1';
const ITEMS_PER_PAGE = 12;

// ===================================
// State Management
// ===================================
const AppState = {
  books: [],
  categories: [],
  authors: [],
  filters: {
    category: '',
    search: '',
    author: '',
    minPrice: '',
    maxPrice: '',
    inStock: ''
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  },
  loading: false,
  error: null
};

// ===================================
// Utility Functions
// ===================================
function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString));
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===================================
// API Functions
// ===================================
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

async function fetchBooks(page = 1, filters = {}) {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: ITEMS_PER_PAGE.toString(),
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
    )
  });

  const result = await fetchAPI(`/books?${searchParams.toString()}`);
  
  // Adapt the response structure from backend
  return {
    books: result.data || [],
    currentPage: result.pagination?.current_page || 1,
    totalPages: result.pagination?.total_pages || 1,
    totalItems: result.pagination?.total_items || 0
  };
}

async function fetchCategories() {
  const result = await fetchAPI('/categories');
  return result.data || [];
}

async function fetchAuthors() {
  const result = await fetchAPI('/authors');  
  return result.data || [];
}

// ===================================
// DOM Manipulation Functions
// ===================================
function showLoading() {
  const booksContent = document.getElementById('books-content');
  if (booksContent) {
    booksContent.innerHTML = `
      <div class="loading">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <h3>Memuat buku...</h3>
        <p>Mohon tunggu sebentar</p>
      </div>
    `;
  }
  AppState.loading = true;
}

function showError(message) {
  const booksContent = document.getElementById('books-content');
  if (booksContent) {
    booksContent.innerHTML = `
      <div class="error">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Oops! Terjadi Kesalahan</h3>
        <p>${message || 'Gagal memuat data buku. Silakan coba lagi.'}</p>
        <button class="retry-btn" onclick="loadBooks()">
          <i class="fas fa-redo"></i>
          Coba Lagi
        </button>
      </div>
    `;
  }
  AppState.loading = false;
  AppState.error = message;
}

function showEmpty() {
  const booksContent = document.getElementById('books-content');
  if (booksContent) {
    booksContent.innerHTML = `
      <div class="empty">
        <div class="empty-icon">
          <i class="fas fa-search"></i>
        </div>
        <h3>Tidak Ada Buku Ditemukan</h3>
        <p>Coba ubah filter atau kata kunci pencarian Anda</p>
      </div>
    `;
  }
  AppState.loading = false;
}

function renderBookCard(book) {
  const authors = book.authors?.map(author => author.name).join(', ') || 'Penulis tidak diketahui';
  const category = book.category?.name || 'Tidak berkategori';
  const isInStock = book.stock > 0;
  
  return `
    <div class="book-card" onclick="openBookModal('${book.id}')">
      <div class="book-card-header">
        <h3 class="book-title">${book.title}</h3>
        <div class="book-meta">
          <div class="book-category">
            <i class="fas fa-tag"></i>
            ${category}
          </div>
          <div class="book-price">${book.formatted_price || formatPrice(book.price)}</div>
        </div>
      </div>
      <div class="book-card-body">
        <div class="book-authors">
          <div class="authors-label">
            <i class="fas fa-user"></i>
            Penulis
          </div>
          <div class="authors-list">
            ${book.authors?.length > 0 ? book.authors.map(author => `
              <div class="author-item">
                <span class="author-name">${author.name}</span>
                <span class="author-role">${author.role || 'Author'}</span>
              </div>
            `).join('') : `
              <div class="author-item">
                <span class="author-name">Tidak diketahui</span>
                <span class="author-role">Author</span>
              </div>
            `}
          </div>
        </div>
        <div class="book-info">
          <div class="book-date">
            <i class="fas fa-calendar"></i>
            ${formatDate(book.published_date)}
          </div>
          <div class="book-stock ${isInStock ? 'in-stock' : 'out-of-stock'}">
            <div class="stock-badge ${isInStock ? 'in-stock' : 'out-of-stock'}"></div>
            ${isInStock ? `Stok: ${book.stock}` : 'Habis'}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBooks(books) {
  const booksContent = document.getElementById('books-content');
  const booksCount = document.getElementById('books-count');
  
  if (!books || books.length === 0) {
    showEmpty();
    if (booksCount) {
      booksCount.textContent = 'Tidak ada buku ditemukan';
    }
    return;
  }

  const booksGrid = books.map(renderBookCard).join('');
  
  if (booksContent) {
    booksContent.innerHTML = `
      <div class="books-grid">
        ${booksGrid}
      </div>
    `;
  }

  if (booksCount) {
    const total = AppState.pagination.totalItems;
    const showing = books.length;
    const from = ((AppState.pagination.currentPage - 1) * ITEMS_PER_PAGE) + 1;
    const to = from + showing - 1;
    booksCount.textContent = `Menampilkan ${from}-${to} dari ${total} buku`;
  }

  AppState.loading = false;
  AppState.error = null;
}

function renderPagination() {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;

  const { currentPage, totalPages } = AppState.pagination;
  
  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  }

  paginationContainer.style.display = 'flex';
  
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  paginationContainer.innerHTML = `
    <button class="pagination-btn" 
            onclick="changePage(${currentPage - 1})" 
            ${prevDisabled ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i>
      Sebelumnya
    </button>
    
    <div class="pagination-info">
      Halaman ${currentPage} dari ${totalPages}
    </div>
    
    <button class="pagination-btn" 
            onclick="changePage(${currentPage + 1})" 
            ${nextDisabled ? 'disabled' : ''}>
      Selanjutnya
      <i class="fas fa-chevron-right"></i>
    </button>
  `;
}

function populateFilters() {
  // Populate categories
  const categorySelect = document.getElementById('category-filter');
  if (categorySelect && AppState.categories.length > 0) {
    categorySelect.innerHTML = `
      <option value="">Semua Kategori</option>
      ${AppState.categories.map(category => `
        <option value="${category.id}" ${AppState.filters.category == category.id ? 'selected' : ''}>
          ${category.name}
        </option>
      `).join('')}
    `;
  }

  // Populate authors
  const authorSelect = document.getElementById('author-filter');
  if (authorSelect && AppState.authors.length > 0) {
    authorSelect.innerHTML = `
      <option value="">Semua Penulis</option>
      ${AppState.authors.map(author => `
        <option value="${author.id}" ${AppState.filters.author == author.id ? 'selected' : ''}>
          ${author.name}
        </option>
      `).join('')}
    `;
  }
}

function updateStats() {
  const totalBooks = document.getElementById('total-books');
  const totalCategories = document.getElementById('total-categories');
  const totalAuthors = document.getElementById('total-authors');

  if (totalBooks) {
    totalBooks.textContent = AppState.pagination.totalItems || AppState.books.length;
  }
  
  if (totalCategories) {
    totalCategories.textContent = AppState.categories.length;
  }
  
  if (totalAuthors) {
    totalAuthors.textContent = AppState.authors.length;
  }
}

// ===================================
// Event Handlers
// ===================================
function handleSearchInput(event) {
  AppState.filters.search = event.target.value;
  debouncedSearch();
}

function handleFilterChange(filterType, value) {
  AppState.filters[filterType] = value;
  AppState.pagination.currentPage = 1; // Reset to first page
  loadBooks();
}

function resetFilters() {
  AppState.filters = {
    category: '',
    search: '',
    author: '',
    minPrice: '',
    maxPrice: '',
    inStock: ''
  };
  AppState.pagination.currentPage = 1;

  // Reset form inputs
  const filterForm = document.getElementById('filters-form');
  if (filterForm) {
    filterForm.reset();
  }

  // Reset search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = '';
  }

  loadBooks();
}

function changePage(newPage) {
  if (newPage < 1 || newPage > AppState.pagination.totalPages) return;
  
  AppState.pagination.currentPage = newPage;
  loadBooks();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// Search & Modal Functions
// ===================================
function openSearch() {
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  
  if (searchOverlay) {
    searchOverlay.classList.add('active');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }
}

function closeSearch() {
  const searchOverlay = document.getElementById('search-overlay');
  if (searchOverlay) {
    searchOverlay.classList.remove('active');
  }
}

function handleSearch(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const searchValue = event.target.value.trim();
    AppState.filters.search = searchValue;
    AppState.pagination.currentPage = 1;
    closeSearch();
    loadBooks();
  } else if (event.key === 'Escape') {
    closeSearch();
  }
}

async function openBookModal(bookId) {
  const modal = document.getElementById('book-modal');
  const modalBody = document.getElementById('modal-body');
  
  if (!modal || !modalBody) return;

  // Show loading in modal
  modalBody.innerHTML = `
    <div class="loading">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Memuat detail buku...</p>
    </div>
  `;
  
  modal.classList.add('active');

  try {
    const response = await fetchAPI(`/books/${bookId}`);
    const book = response.data || response;
    
    modalBody.innerHTML = `
      <div class="book-detail">
        <div class="book-detail-header">
          <h2>${book.title}</h2>
          <div class="book-detail-meta">
            <div class="detail-item">
              <strong>Kategori:</strong> ${book.category?.name || 'Tidak berkategori'}
            </div>
            <div class="detail-item">
              <strong>Harga:</strong> ${book.formatted_price || formatPrice(book.price)}
            </div>
            <div class="detail-item">
              <strong>Tanggal Terbit:</strong> ${formatDate(book.published_date)}
            </div>
            <div class="detail-item">
              <strong>ISBN:</strong> ${book.isbn || 'Tidak tersedia'}
            </div>
            <div class="detail-item">
              <strong>Stok:</strong> 
              <span class="${book.stock > 0 ? 'success' : 'error'}">
                ${book.stock > 0 ? `${book.stock} tersedia` : 'Habis'}
              </span>
            </div>
          </div>
        </div>
        
        <div class="book-detail-authors">
          <h3>Penulis</h3>
          <div class="authors-list">
            ${book.authors?.length > 0 ? book.authors.map(author => `
              <div class="author-detail">
                <div class="author-info">
                  <strong>${author.name}</strong>
                  <span class="author-role">(${author.bookAuthor?.role || 'Author'})</span>
                </div>
                ${author.biography ? `<p class="author-bio">${author.biography}</p>` : ''}
              </div>
            `).join('') : '<p>Informasi penulis tidak tersedia</p>'}
          </div>
        </div>
        
        ${book.description ? `
          <div class="book-detail-description">
            <h3>Deskripsi</h3>
            <p>${book.description}</p>
          </div>
        ` : ''}
      </div>
    `;
  } catch (error) {
    console.error('Error loading book details:', error);
    modalBody.innerHTML = `
      <div class="error">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Gagal Memuat Detail</h3>
        <p>Terjadi kesalahan saat memuat detail buku.</p>
      </div>
    `;
  }
}

function closeModal() {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => modal.classList.remove('active'));
}

// ===================================
// Data Loading Functions
// ===================================
async function loadBooks() {
  showLoading();
  
  try {
    const response = await fetchBooks(AppState.pagination.currentPage, AppState.filters);
    
    AppState.books = response.books || [];
    AppState.pagination = {
      currentPage: response.currentPage || 1,
      totalPages: response.totalPages || 1,
      totalItems: response.totalItems || 0
    };
    
    renderBooks(AppState.books);
    renderPagination();
    updateStats();
    
  } catch (error) {
    console.error('Error loading books:', error);
    showError('Gagal memuat data buku. Pastikan server berjalan dengan benar.');
  }
}

async function loadCategories() {
  try {
    const categories = await fetchCategories();
    AppState.categories = categories || [];
    populateFilters();
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function loadAuthors() {
  try {
    const authors = await fetchAuthors();
    AppState.authors = authors || [];
    populateFilters();
  } catch (error) {
    console.error('Error loading authors:', error);
  }
}

async function initializeApp() {
  // Load initial data
  await Promise.all([
    loadCategories(),
    loadAuthors(),
    loadBooks()
  ]);
}

// ===================================
// Debounced Search
// ===================================
const debouncedSearch = debounce(() => {
  AppState.pagination.currentPage = 1;
  loadBooks();
}, 300);

// ===================================
// Event Listeners
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize app
  initializeApp();

  // Search functionality
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const searchOverlay = document.getElementById('search-overlay');
  const searchClose = document.getElementById('search-close');

  if (searchBtn) {
    searchBtn.addEventListener('click', openSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', handleSearch);
  }

  if (searchClose) {
    searchClose.addEventListener('click', closeSearch);
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', function(e) {
      if (e.target === searchOverlay) {
        closeSearch();
      }
    });
  }

  // Filter functionality
  const categoryFilter = document.getElementById('category-filter');
  const authorFilter = document.getElementById('author-filter');
  const minPriceFilter = document.getElementById('min-price-filter');
  const maxPriceFilter = document.getElementById('max-price-filter');
  const stockFilter = document.getElementById('stock-filter');
  const filterReset = document.getElementById('filter-reset');

  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => 
      handleFilterChange('category', e.target.value)
    );
  }

  if (authorFilter) {
    authorFilter.addEventListener('change', (e) => 
      handleFilterChange('author', e.target.value)
    );
  }

  if (minPriceFilter) {
    minPriceFilter.addEventListener('input', debounce((e) => 
      handleFilterChange('minPrice', e.target.value), 500
    ));
  }

  if (maxPriceFilter) {
    maxPriceFilter.addEventListener('input', debounce((e) => 
      handleFilterChange('maxPrice', e.target.value), 500
    ));
  }

  if (stockFilter) {
    stockFilter.addEventListener('change', (e) => 
      handleFilterChange('inStock', e.target.value)
    );
  }

  if (filterReset) {
    filterReset.addEventListener('click', resetFilters);
  }

  // Modal functionality
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  const modalCloses = document.querySelectorAll('.modal-close');

  modalCloses.forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModal);
  });

  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closeModal();
      }
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
      closeSearch();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  // Mobile menu (if implemented)
  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      // Toggle mobile navigation
      const nav = document.querySelector('.nav');
      if (nav) {
        nav.classList.toggle('mobile-active');
      }
    });
  }

  // Add smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// ===================================
// Global Functions (for inline onclick handlers)
// ===================================
window.openBookModal = openBookModal;
window.changePage = changePage;
window.loadBooks = loadBooks;

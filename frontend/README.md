# Frontend Toko Buku Online

Frontend aplikasi toko buku online yang responsif dengan fitur pencarian, filter, dan tampilan detail buku.

## Fitur

- **Tampilan Responsif**: Optimized untuk desktop, tablet, dan mobile
- **Pencarian Real-time**: Pencarian buku dengan debouncing
- **Filter Multi-kriteria**: Filter berdasarkan kategori, penulis, harga, dan stok
- **Pagination**: Navigasi halaman untuk banyak data
- **Modal Detail**: Tampilan detail lengkap untuk setiap buku
- **Loading States**: Indikator loading dan error handling
- **Keyboard Shortcuts**: Ctrl+K untuk membuka pencarian

## Struktur File

```
frontend/
├── index.html      # Struktur HTML utama
├── styles.css      # Styling responsif dengan CSS Grid & Flexbox
├── script.js       # JavaScript untuk API consumption & interaksi
└── README.md       # Dokumentasi ini
```

## Cara Menjalankan

1. **Pastikan Backend Berjalan**
   ```bash
   cd ../
   npm start
   ```
   Backend harus berjalan di `http://localhost:3000`

2. **Buka Frontend**
   - Buka file `index.html` di browser, atau
   - Gunakan Live Server di VS Code
   - Atau setup local server:
   ```bash
   # Menggunakan Python
   python -m http.server 8080
   
   # Menggunakan Node.js http-server
   npx http-server -p 8080
   ```

3. **Akses Aplikasi**
   - Langsung: `file:///path/to/index.html`
   - Local server: `http://localhost:8080`

## Konfigurasi

Konfigurasi API endpoint ada di `script.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
const ITEMS_PER_PAGE = 12;
```

Sesuaikan `API_BASE_URL` jika backend berjalan di port/host yang berbeda.

## Fitur UI/UX

### Responsif Design
- **Desktop**: Grid 3-4 kolom, sidebar filters
- **Tablet**: Grid 2 kolom, collapsible filters  
- **Mobile**: Single column, hamburger menu

### Interaksi
- **Pencarian**: Ketik untuk search real-time
- **Filter**: Dropdown dan input untuk filtering
- **Sorting**: Berdasarkan kategori, penulis, harga
- **Detail**: Klik card untuk modal detail
- **Pagination**: Navigasi prev/next

### Keyboard Shortcuts
- `Ctrl+K`: Buka pencarian
- `Escape`: Tutup modal/overlay
- `Enter`: Submit pencarian

## API Integration

Frontend mengkonsumsi REST API dari backend:

- `GET /api/books` - Daftar buku dengan pagination & filter
- `GET /api/books/:id` - Detail buku
- `GET /api/categories` - Daftar kategori
- `GET /api/authors` - Daftar penulis

## Styling

Menggunakan:
- **CSS Custom Properties** untuk theme management
- **CSS Grid** untuk responsive layout
- **Flexbox** untuk component alignment
- **Font Awesome** untuk icons
- **Google Fonts (Inter)** untuk typography

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Pengembangan

Untuk modifikasi:

1. **HTML**: Edit struktur di `index.html`
2. **Styling**: Modifikasi CSS variables dan classes di `styles.css`
3. **Functionality**: Update JavaScript di `script.js`

### CSS Variables
```css
:root {
  --primary-color: #3b82f6;
  --text-primary: #1e293b;
  --bg-primary: #ffffff;
  /* ... */
}
```

### State Management
```javascript
const AppState = {
  books: [],
  categories: [],
  authors: [],
  filters: { /* ... */ },
  pagination: { /* ... */ }
};
```

## Troubleshooting

**Tidak ada data yang muncul:**
- Pastikan backend berjalan di `http://localhost:3000`
- Cek Network tab di Developer Tools
- Pastikan CORS enabled di backend

**Error CORS:**
- Pastikan backend menggunakan cors middleware
- Atau jalankan frontend melalui http-server

**Styling tidak muncul:**
- Pastikan file CSS ter-load dengan benar
- Cek console untuk error 404

## Performance

- **Debounced Search**: 300ms delay untuk mengurangi API calls
- **Pagination**: Load data per halaman (12 items)
- **Image Optimization**: Lazy loading untuk gambar buku
- **Caching**: Browser caching untuk static assets

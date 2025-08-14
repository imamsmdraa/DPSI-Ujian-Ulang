# 🚀 Panduan Menjalankan Sistem Toko Buku Online

## 📋 Prerequisites
Pastikan terinstall:
- **Node.js** (v14 atau lebih baru)
- **Python** (untuk HTTP server frontend)
- **Git** (opsional, untuk clone repository)

## 🏃‍♂️ Cara Menjalankan

### 1. Persiapan Backend
```powershell
# Masuk ke direktori backend
cd "D:\KULIAH\DESAIN PENGEMBANGAN SISTEM\UJUL\backend"

# Install dependencies
npm install

# Jalankan server backend
npm start
```

**Backend akan berjalan di:** `http://localhost:3000`
- API Documentation: `http://localhost:3000`
- Health Check: `http://localhost:3000/health`

### 2. Persiapan Frontend
```powershell
# Buka terminal baru, masuk ke direktori utama
cd "D:\KULIAH\DESAIN PENGEMBANGAN SISTEM\UJUL"

# Jalankan HTTP server untuk frontend
python -m http.server 8080
```

**Frontend akan berjalan di:** `http://localhost:8080/frontend/`

### 3. Akses Aplikasi
- Buka browser dan kunjungi: `http://localhost:8080/frontend/`
- Aplikasi toko buku online siap digunakan!

## 🔧 Konfigurasi

### Database
- Menggunakan **SQLite** (tidak perlu setup MySQL)
- Database file: `backend/database/bookstore.db`
- Auto-seeding dengan data sample

### API Endpoints
- `GET /api/v1/books` - Daftar buku dengan pagination & filter
- `GET /api/v1/books/:id` - Detail buku
- `GET /api/v1/categories` - Daftar kategori
- `GET /api/v1/authors` - Daftar penulis

## ✨ Fitur Aplikasi

### Frontend Features
- ✅ **Responsive Design** - Mobile, tablet, desktop friendly
- ✅ **Real-time Search** - Pencarian buku dengan debouncing
- ✅ **Multi-Filter** - Filter berdasarkan kategori, penulis, harga, stok
- ✅ **Pagination** - Navigasi halaman untuk data banyak
- ✅ **Book Details Modal** - Detail lengkap setiap buku
- ✅ **Loading States** - Indikator loading dan error handling
- ✅ **Keyboard Shortcuts** - Ctrl+K untuk search

### Backend Features  
- ✅ **RESTful API** - Endpoint terstruktur dengan versioning
- ✅ **Database Relations** - Many-to-many book-author, one-to-many category-book
- ✅ **Pagination & Filtering** - Query optimization
- ✅ **CORS Support** - Frontend-backend integration
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Data Validation** - Input validation dan sanitization

## 📊 Data Sample
Aplikasi sudah include data sample:
- **2 Books**: Laskar Pelangi, Bumi Manusia
- **3 Authors**: Andrea Hirata, Tere Liye, Pramoedya Ananta Toer  
- **5 Categories**: Fiction, Non-Fiction, Science, Technology, History

## 🛠 Development

### Struktur Project
```
UJUL/
├── backend/                 # Node.js + Express + Sequelize
│   ├── config/             # Database configuration
│   ├── controllers/        # API route handlers
│   ├── models/             # Sequelize models
│   ├── database/           # SQLite database file
│   └── server.js           # Main server file
├── frontend/               # HTML + CSS + JavaScript
│   ├── index.html          # Main HTML structure
│   ├── styles.css          # Responsive CSS styling
│   └── script.js           # Frontend functionality
└── README.md               # This file
```

### Teknologi Stack
**Backend:**
- Node.js + Express.js
- Sequelize ORM + SQLite
- CORS, Body-parser, Dotenv

**Frontend:**
- HTML5 + CSS3 + ES6 JavaScript
- Font Awesome icons
- Google Fonts (Inter)
- Responsive Grid & Flexbox

## 🧪 Testing API

### Test dengan PowerShell
```powershell
# Get all books
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/books" -Method GET

# Get categories
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/categories" -Method GET

# Get authors
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/authors" -Method GET

# Get book details
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/books/BOO001" -Method GET
```

## 🐛 Troubleshooting

**Frontend tidak menampilkan data:**
1. Pastikan backend berjalan di `http://localhost:3000`
2. Cek Network tab di Developer Tools untuk error CORS
3. Refresh halaman frontend

**Backend gagal start:**
1. Pastikan tidak ada aplikasi lain yang menggunakan port 3000
2. Jalankan `npm install` ulang jika ada error dependencies
3. Cek file `.env` untuk konfigurasi database

**Data tidak muncul:**
1. Database mungkin kosong, restart backend server untuk auto-seeding
2. Cek relasi database dengan menjalankan `node test-relations.js`

## 🎯 Testing Functionality

### Test Scenario Backend-Frontend Integration:
1. ✅ **Load Books**: Homepage menampilkan 2 buku dengan kategori dan penulis
2. ✅ **Search**: Ketik "Laskar" di search box, tampil hasil filter
3. ✅ **Filter Category**: Pilih "Fiction" di dropdown kategori
4. ✅ **Filter Author**: Pilih "Andrea Hirata" di dropdown penulis  
5. ✅ **Book Details**: Klik card buku untuk lihat modal detail
6. ✅ **Responsive**: Resize browser/buka di mobile untuk test responsive

### Expected Results:
- ✅ Data buku muncul dengan kategori "Fiction" 
- ✅ Authors terlihat: "Andrea Hirata", "Pramoedya Ananta Toer"
- ✅ Harga terformat: "Rp 75.000", "Rp 80.000"
- ✅ Stock status: "Stok: 50", "Stok: 30"
- ✅ Search dan filter berfungsi real-time
- ✅ Modal detail menampilkan informasi lengkap

## 🏆 Success Criteria
✅ **Backend berjalan** di port 3000 dengan API endpoints    
✅ **Frontend berjalan** di port 8080 dengan UI responsif  
✅ **Database relasi** berfungsi (book-author, book-category)  
✅ **API Integration** - frontend sukses konsumsi backend API  
✅ **Responsive Design** - tampilan adaptif mobile/tablet/desktop  
✅ **Full Functionality** - search, filter, pagination, modal detail  

🎉 **STATUS: FULLY INTEGRATED & RUNNING!** 🎉

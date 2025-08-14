# 📚 SUB-CPMK-5: Implementasi Backend dengan Node.js + Sequelize ORM

## 🎯 **Model Book, Author, dan Category dengan Relasi Lengkap**

Implementasi model backend berdasarkan ERD yang telah dibuat sebelumnya, menggunakan **Node.js + Sequelize ORM** dengan relasi **hasMany**, **belongsToMany**, dan **belongsTo**.

---

## 🏗️ **Struktur Project**

```
backend/
├── config/
│   └── database.js          # Konfigurasi database connection
├── models/
│   ├── Category.js          # Model Category
│   ├── Author.js            # Model Author
│   ├── Book.js              # Model Book
│   ├── BookAuthor.js        # Model junction table
│   └── index.js             # Setup associations & sync
├── controllers/
│   ├── categoryController.js # CRUD Category
│   ├── authorController.js   # CRUD Author
│   └── bookController.js     # CRUD Book
├── package.json
├── .env
└── server.js                # Main server file
```

---

## 🔗 **Implementasi Relasi Sequelize**

### **1. Category ↔ Book (One-to-Many)**

#### **hasMany - Category memiliki banyak Book**
```javascript
// Di models/index.js
Category.hasMany(Book, {
  foreignKey: 'category_id',
  as: 'books',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL' // Jika kategori dihapus, category_id jadi NULL
});
```

#### **belongsTo - Book milik satu Category**
```javascript
Book.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
});
```

### **2. Book ↔ Author (Many-to-Many)**

#### **belongsToMany - Book memiliki banyak Author**
```javascript
Book.belongsToMany(Author, {
  through: BookAuthor,        // Junction table
  foreignKey: 'book_id',      // FK di BookAuthor ke Book
  otherKey: 'author_id',      // FK di BookAuthor ke Author
  as: 'authors',              // Alias untuk query
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});
```

#### **belongsToMany - Author menulis banyak Book**
```javascript
Author.belongsToMany(Book, {
  through: BookAuthor,        // Junction table
  foreignKey: 'author_id',    // FK di BookAuthor ke Author
  otherKey: 'book_id',        // FK di BookAuthor ke Book
  as: 'books',                // Alias untuk query
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});
```

### **3. Direct Associations ke Junction Table**

#### **hasMany - Untuk mengakses data di BookAuthor**
```javascript
// Book -> BookAuthor
Book.hasMany(BookAuthor, {
  foreignKey: 'book_id',
  as: 'bookAuthors',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});

// Author -> BookAuthor  
Author.hasMany(BookAuthor, {
  foreignKey: 'author_id',
  as: 'bookAuthors',
  onUpdate: 'CASCADE', 
  onDelete: 'CASCADE'
});
```

#### **belongsTo - BookAuthor ke parent tables**
```javascript
// BookAuthor -> Book
BookAuthor.belongsTo(Book, {
  foreignKey: 'book_id',
  as: 'book',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});

// BookAuthor -> Author
BookAuthor.belongsTo(Author, {
  foreignKey: 'author_id', 
  as: 'author',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});
```

---

## 📊 **Definisi Model dengan Sequelize**

### **Model Category**
```javascript
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'category',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
```

### **Model Author**
```javascript
const Author = sequelize.define('Author', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  biography: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'author',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
```

### **Model Book**
```javascript
const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  published_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  category_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: 'category',
      key: 'id'
    }
  },
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'book',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
```

### **Model BookAuthor (Junction Table)**
```javascript
const BookAuthor = sequelize.define('BookAuthor', {
  book_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'book',
      key: 'id'
    }
  },
  author_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'author', 
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('Primary Author', 'Co-Author', 'Editor', 'Translator'),
    allowNull: false,
    defaultValue: 'Primary Author'
  },
  contribution_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100.00
  }
}, {
  tableName: 'book_author',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false // Tidak perlu updated_at
});
```

---

## 🧪 **Contoh Query dengan Relasi**

### **1. Mendapatkan Book dengan Authors dan Category**
```javascript
const book = await Book.findOne({
  where: { id: 'BOO001' },
  include: [
    {
      model: Author,
      as: 'authors',
      through: { 
        attributes: ['role', 'contribution_percentage'] 
      }
    },
    {
      model: Category,
      as: 'category'
    }
  ]
});
```

### **2. Mendapatkan Author dengan Books**
```javascript
const author = await Author.findOne({
  where: { id: 'AUT001' },
  include: [{
    model: Book,
    as: 'books',
    through: { 
      attributes: ['role', 'contribution_percentage'] 
    },
    include: [{
      model: Category,
      as: 'category'
    }]
  }]
});
```

### **3. Membuat Book dengan Multiple Authors**
```javascript
// Dengan transaction
const transaction = await sequelize.transaction();

try {
  // Buat book
  const book = await Book.create({
    title: 'Buku Kolaborasi',
    category_id: 'CAT001',
    price: 50000,
    stock: 100
  }, { transaction });

  // Tambahkan authors
  await BookAuthor.bulkCreate([
    {
      book_id: book.id,
      author_id: 'AUT001',
      role: 'Primary Author',
      contribution_percentage: 70.00
    },
    {
      book_id: book.id,
      author_id: 'AUT002', 
      role: 'Co-Author',
      contribution_percentage: 30.00
    }
  ], { transaction });

  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### **4. Query Buku Kolaborasi (Multiple Authors)**
```javascript
const collaborativeBooks = await BookAuthor.findAll({
  attributes: [
    'book_id',
    [sequelize.fn('COUNT', sequelize.col('author_id')), 'author_count']
  ],
  group: ['book_id'],
  having: sequelize.literal('author_count > 1'),
  include: [{
    model: Book,
    as: 'book',
    include: [
      { model: Category, as: 'category' },
      { 
        model: Author, 
        as: 'authors',
        through: { attributes: ['role', 'contribution_percentage'] }
      }
    ]
  }]
});
```

---

## 🚀 **API Endpoints yang Tersedia**

### **Books API** (`/api/v1/books`)
- `GET /` - List semua buku dengan filter & pagination
- `GET /:id` - Detail buku dengan authors & category
- `POST /` - Buat buku baru dengan authors
- `PUT /:id` - Update buku
- `DELETE /:id` - Hapus buku
- `POST /:id/authors` - Tambah author ke buku
- `DELETE /:id/authors/:author_id` - Hapus author dari buku

### **Authors API** (`/api/v1/authors`)
- `GET /` - List semua author dengan pagination
- `GET /:id` - Detail author dengan books
- `POST /` - Buat author baru
- `PUT /:id` - Update author
- `DELETE /:id` - Hapus author
- `GET /:id/books` - Books dari author tertentu

### **Categories API** (`/api/v1/categories`)
- `GET /` - List semua kategori
- `GET /:id` - Detail kategori dengan books
- `POST /` - Buat kategori baru
- `PUT /:id` - Update kategori
- `DELETE /:id` - Hapus kategori

---

## 🔧 **Cara Menjalankan**

### **1. Install Dependencies**
```bash
cd backend
npm install
```

### **2. Setup Database**
```bash
# Setup environment variables di .env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bookstore_db
DB_USER=root
DB_PASS=
```

### **3. Jalankan Server**
```bash
# Development mode
npm run dev

# Production mode  
npm start
```

### **4. Database akan otomatis:**
- ✅ Connect ke MySQL
- ✅ Sync table structures
- ✅ Insert sample data (development)

---

## ✨ **Fitur Unggulan Implementation**

### **🔗 Relasi Lengkap**
- ✅ **hasMany**: Category → Book
- ✅ **belongsTo**: Book → Category  
- ✅ **belongsToMany**: Book ↔ Author (Many-to-Many)
- ✅ **hasMany & belongsTo**: Akses junction table data

### **🛡️ Data Integrity**
- ✅ Foreign Key constraints
- ✅ Cascade operations (UPDATE/DELETE)
- ✅ Validation rules
- ✅ Transaction support

### **🎯 Advanced Features**
- ✅ Pagination & filtering
- ✅ Search functionality
- ✅ Contribution percentage validation
- ✅ Auto-generated IDs
- ✅ Comprehensive error handling
- ✅ API documentation ready

### **📊 Business Logic**
- ✅ Total contribution ≤ 100%
- ✅ Minimum 1 author per book
- ✅ Stock management
- ✅ Popular books algorithm

Backend API sudah siap untuk diintegrasikan dengan frontend! 🎉

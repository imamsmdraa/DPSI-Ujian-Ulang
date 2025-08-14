const { sequelize } = require('../config/database');

// Import semua models
const Category = require('./Category');
const Author = require('./Author');
const Book = require('./Book');
const BookAuthor = require('./BookAuthor');
const User = require('./User');

/**
 * Setup Associations/Relationships antar Models
 * Implementasi relasi berdasarkan ERD
 */
const setupAssociations = () => {
  
  // ========================================
  // 1. CATEGORY -> BOOK (One-to-Many)
  // ========================================
  
  /**
   * Relasi hasMany: Category memiliki banyak Book
   * - foreignKey: category_id di tabel book
   * - as: alias untuk query
   * - onUpdate/onDelete: CASCADE behavior
   */
  Category.hasMany(Book, {
    foreignKey: 'category_id',
    as: 'books',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL' // Jika kategori dihapus, category_id di book jadi NULL
  });

  /**
   * Relasi belongsTo: Book milik satu Category
   * - foreignKey: category_id di tabel book
   * - as: alias untuk query
   */
  Book.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  });

  // ========================================
  // 2. BOOK <-> AUTHOR (Many-to-Many)
  // ========================================
  
  /**
   * Relasi belongsToMany: Book memiliki banyak Author melalui BookAuthor
   * - through: junction table BookAuthor
   * - foreignKey: book_id di tabel book_author
   * - otherKey: author_id di tabel book_author
   * - as: alias untuk query
   */
  Book.belongsToMany(Author, {
    through: BookAuthor,
    foreignKey: 'book_id',
    otherKey: 'author_id',
    as: 'authors',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  /**
   * Relasi belongsToMany: Author memiliki banyak Book melalui BookAuthor
   * - through: junction table BookAuthor
   * - foreignKey: author_id di tabel book_author
   * - otherKey: book_id di tabel book_author
   * - as: alias untuk query
   */
  Author.belongsToMany(Book, {
    through: BookAuthor,
    foreignKey: 'author_id',
    otherKey: 'book_id',
    as: 'books',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  // ========================================
  // 3. Direct Associations ke BookAuthor
  // Untuk mengakses data junction table
  // ========================================
  
  /**
   * Relasi hasMany: Book memiliki banyak BookAuthor
   * Berguna untuk mengakses data di junction table (role, contribution_percentage)
   */
  Book.hasMany(BookAuthor, {
    foreignKey: 'book_id',
    as: 'bookAuthors',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  /**
   * Relasi hasMany: Author memiliki banyak BookAuthor
   * Berguna untuk mengakses data di junction table
   */
  Author.hasMany(BookAuthor, {
    foreignKey: 'author_id',
    as: 'bookAuthors',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  /**
   * Relasi belongsTo: BookAuthor milik satu Book
   */
  BookAuthor.belongsTo(Book, {
    foreignKey: 'book_id',
    as: 'book',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  /**
   * Relasi belongsTo: BookAuthor milik satu Author
   */
  BookAuthor.belongsTo(Author, {
    foreignKey: 'author_id',
    as: 'author',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });

  console.log('✅ Model associations have been set up successfully');
};

// Setup associations
setupAssociations();

/**
 * Sync semua models dengan database
 * - force: true akan drop dan recreate tables (hati-hati!)
 * - alter: true akan alter table structure sesuai model
 */
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};

/**
 * Seed data untuk testing
 */
const seedData = async () => {
  try {
    // Check jika data sudah ada
    const categoryCount = await Category.count();
    if (categoryCount > 0) {
      console.log('📊 Data already exists, skipping seed');
      return;
    }

    console.log('🌱 Seeding database...');

    // Seed Categories
    const categories = await Category.bulkCreate([
      { id: 'CAT001', name: 'Fiction' },
      { id: 'CAT002', name: 'Non-Fiction' },
      { id: 'CAT003', name: 'Science' },
      { id: 'CAT004', name: 'Technology' },
      { id: 'CAT005', name: 'History' }
    ]);

    // Seed Authors
    const authors = await Author.bulkCreate([
      {
        id: 'AUT001',
        name: 'Andrea Hirata',
        biography: 'Penulis Indonesia terkenal dengan karya Laskar Pelangi'
      },
      {
        id: 'AUT002',
        name: 'Tere Liye',
        biography: 'Penulis novel populer Indonesia dengan banyak karya bestseller'
      },
      {
        id: 'AUT003',
        name: 'Pramoedya Ananta Toer',
        biography: 'Sastrawan Indonesia pemenang berbagai penghargaan internasional'
      }
    ]);

    // Seed Books
    const books = await Book.bulkCreate([
      {
        id: 'BOO001',
        title: 'Laskar Pelangi',
        published_date: '2005-08-15',
        category_id: 'CAT001',
        isbn: '9786022912907',
        price: 75000.00,
        stock: 50,
        description: 'Novel tentang perjuangan anak-anak di Belitung untuk bersekolah'
      },
      {
        id: 'BOO002',
        title: 'Bumi Manusia',
        published_date: '1980-06-01',
        category_id: 'CAT001',
        isbn: '9786022910187',
        price: 80000.00,
        stock: 30,
        description: 'Novel sejarah tentang kehidupan di masa kolonial Belanda'
      }
    ]);

    // Seed BookAuthor relationships
    await BookAuthor.bulkCreate([
      {
        book_id: 'BOO001',
        author_id: 'AUT001',
        role: 'Primary Author',
        contribution_percentage: 100.00
      },
      {
        book_id: 'BOO002',
        author_id: 'AUT003',
        role: 'Primary Author',
        contribution_percentage: 100.00
      }
    ]);

    console.log('✅ Database seeded successfully');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Export semua models dan utilities
module.exports = {
  sequelize,
  Category,
  Author,
  Book,
  BookAuthor,
  User,
  setupAssociations,
  syncDatabase,
  seedData
};

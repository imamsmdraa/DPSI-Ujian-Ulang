const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Book
 * Relasi: 
 * - belongsTo dengan Category (Many-to-One)
 * - belongsToMany dengan Author melalui BookAuthor (Many-to-Many)
 */
const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Book ID tidak boleh kosong'
      },
      len: {
        args: [1, 50],
        msg: 'Book ID harus antara 1-50 karakter'
      }
    }
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Judul buku tidak boleh kosong'
      },
      len: {
        args: [1, 500],
        msg: 'Judul buku harus antara 1-500 karakter'
      }
    }
  },
  published_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Format tanggal tidak valid'
      },
      isBeforeToday(value) {
        if (value && new Date(value) > new Date()) {
          throw new Error('Tanggal publikasi tidak boleh di masa depan');
        }
      }
    }
  },
  category_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: 'category',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: {
      msg: 'ISBN sudah digunakan oleh buku lain'
    },
    validate: {
      len: {
        args: [10, 20],
        msg: 'ISBN harus antara 10-20 karakter'
      },
      isISBN(value) {
        if (value && !/^(\d{10}|\d{13}|[\d-]{13,17})$/.test(value.replace(/-/g, ''))) {
          throw new Error('Format ISBN tidak valid');
        }
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Harga tidak boleh negatif'
      },
      isDecimal: {
        msg: 'Harga harus berupa angka desimal'
      }
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Stok tidak boleh negatif'
      },
      isInt: {
        msg: 'Stok harus berupa bilangan bulat'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 10000],
        msg: 'Deskripsi tidak boleh lebih dari 10000 karakter'
      }
    }
  }
}, {
  tableName: 'book',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['title'],
      name: 'idx_book_title'
    },
    {
      fields: ['published_date'],
      name: 'idx_book_published_date'
    },
    {
      fields: ['category_id'],
      name: 'idx_book_category'
    },
    {
      unique: true,
      fields: ['isbn'],
      name: 'uk_book_isbn'
    }
  ],
  hooks: {
    beforeValidate: (book) => {
      // Trim whitespace
      if (book.title) {
        book.title = book.title.trim();
      }
      if (book.description) {
        book.description = book.description.trim();
      }
      if (book.isbn) {
        book.isbn = book.isbn.replace(/[-\s]/g, ''); // Remove dashes and spaces
      }
    },
    beforeCreate: (book) => {
      // Auto-generate ID jika tidak ada
      if (!book.id) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        book.id = `BOO${timestamp}${random}`.toUpperCase().substring(0, 50);
      }
    }
  }
});

// Instance methods
Book.prototype.toJSON = function() {
  const values = { ...this.get() };
  // Format price untuk display
  if (values.price) {
    values.formatted_price = `Rp ${Number(values.price).toLocaleString('id-ID')}`;
  }
  return values;
};

Book.prototype.isInStock = function() {
  return this.stock > 0;
};

Book.prototype.updateStock = async function(quantity) {
  if (this.stock + quantity < 0) {
    throw new Error('Stok tidak mencukupi');
  }
  this.stock += quantity;
  return await this.save();
};

Book.prototype.getAuthors = async function() {
  return await this.getAuthors({
    through: {
      attributes: ['role', 'contribution_percentage']
    }
  });
};

// Class methods
Book.searchByTitle = function(title) {
  return this.findAll({
    where: {
      title: {
        [sequelize.Sequelize.Op.like]: `%${title}%`
      }
    },
    include: [
      {
        model: sequelize.models.Category,
        as: 'category'
      },
      {
        model: sequelize.models.Author,
        as: 'authors',
        through: { attributes: ['role', 'contribution_percentage'] }
      }
    ]
  });
};

Book.findByCategory = function(categoryId) {
  return this.findAll({
    where: {
      category_id: categoryId
    },
    include: [
      {
        model: sequelize.models.Category,
        as: 'category'
      },
      {
        model: sequelize.models.Author,
        as: 'authors',
        through: { attributes: ['role', 'contribution_percentage'] }
      }
    ]
  });
};

Book.findByAuthor = function(authorId) {
  return this.findAll({
    include: [
      {
        model: sequelize.models.Author,
        as: 'authors',
        where: { id: authorId },
        through: { attributes: ['role', 'contribution_percentage'] }
      },
      {
        model: sequelize.models.Category,
        as: 'category'
      }
    ]
  });
};

Book.getPopular = function(limit = 10) {
  return this.findAll({
    order: [['stock', 'ASC']], // Buku dengan stok sedikit = populer
    limit: limit,
    include: [
      {
        model: sequelize.models.Category,
        as: 'category'
      },
      {
        model: sequelize.models.Author,
        as: 'authors',
        through: { attributes: ['role', 'contribution_percentage'] }
      }
    ]
  });
};

Book.getNewReleases = function(limit = 10) {
  return this.findAll({
    order: [['published_date', 'DESC']],
    limit: limit,
    include: [
      {
        model: sequelize.models.Category,
        as: 'category'
      },
      {
        model: sequelize.models.Author,
        as: 'authors',
        through: { attributes: ['role', 'contribution_percentage'] }
      }
    ]
  });
};

module.exports = Book;

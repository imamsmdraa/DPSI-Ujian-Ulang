const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Author
 * Relasi: belongsToMany dengan Book melalui BookAuthor (Many-to-Many)
 */
const Author = sequelize.define('Author', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Author ID tidak boleh kosong'
      },
      len: {
        args: [1, 50],
        msg: 'Author ID harus antara 1-50 karakter'
      }
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nama author tidak boleh kosong'
      },
      len: {
        args: [2, 255],
        msg: 'Nama author harus antara 2-255 karakter'
      }
    }
  },
  biography: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 5000],
        msg: 'Biografi tidak boleh lebih dari 5000 karakter'
      }
    }
  }
}, {
  tableName: 'author',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['name'],
      name: 'idx_author_name'
    }
  ],
  hooks: {
    beforeValidate: (author) => {
      // Trim whitespace
      if (author.name) {
        author.name = author.name.trim();
      }
      if (author.biography) {
        author.biography = author.biography.trim();
      }
    },
    beforeCreate: (author) => {
      // Auto-generate ID jika tidak ada
      if (!author.id) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        author.id = `AUT${timestamp}${random}`.toUpperCase().substring(0, 50);
      }
    }
  }
});

// Instance methods
Author.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

Author.prototype.getBookCount = async function() {
  const BookAuthor = sequelize.models.BookAuthor;
  const count = await BookAuthor.count({
    where: {
      author_id: this.id
    }
  });
  return count;
};

// Class methods
Author.findByName = function(name) {
  return this.findAll({
    where: {
      name: {
        [sequelize.Sequelize.Op.like]: `%${name}%`
      }
    }
  });
};

Author.getWithBooks = function() {
  return this.findAll({
    include: [{
      model: sequelize.models.Book,
      as: 'books',
      through: { 
        attributes: ['role', 'contribution_percentage'],
        as: 'bookAuthor'
      },
      include: [{
        model: sequelize.models.Category,
        as: 'category'
      }]
    }]
  });
};

Author.getMostProductive = function(limit = 10) {
  return this.findAll({
    include: [{
      model: sequelize.models.BookAuthor,
      as: 'bookAuthors',
      attributes: []
    }],
    attributes: [
      'id',
      'name',
      'biography',
      [sequelize.fn('COUNT', sequelize.col('bookAuthors.book_id')), 'book_count']
    ],
    group: ['Author.id'],
    order: [[sequelize.literal('book_count'), 'DESC']],
    limit: limit
  });
};

module.exports = Author;

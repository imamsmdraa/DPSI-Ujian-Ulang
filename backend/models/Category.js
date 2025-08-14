const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Category
 * Relasi: hasMany dengan Book (One-to-Many)
 */
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Category ID tidak boleh kosong'
      },
      len: {
        args: [1, 50],
        msg: 'Category ID harus antara 1-50 karakter'
      }
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Nama kategori sudah ada'
    },
    validate: {
      notEmpty: {
        msg: 'Nama kategori tidak boleh kosong'
      },
      len: {
        args: [2, 100],
        msg: 'Nama kategori harus antara 2-100 karakter'
      }
    }
  }
}, {
  tableName: 'category',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['name'],
      name: 'uk_category_name'
    }
  ],
  hooks: {
    beforeValidate: (category) => {
      // Trim whitespace
      if (category.name) {
        category.name = category.name.trim();
      }
    },
    beforeCreate: (category) => {
      // Auto-generate ID jika tidak ada
      if (!category.id) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        category.id = `CAT${timestamp}${random}`.toUpperCase().substring(0, 50);
      }
    }
  }
});

// Instance methods
Category.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

// Class methods
Category.findByName = function(name) {
  return this.findOne({
    where: {
      name: name
    }
  });
};

Category.getWithBooks = function() {
  return this.findAll({
    include: [{
      model: sequelize.models.Book,
      as: 'books',
      include: [{
        model: sequelize.models.Author,
        as: 'authors',
        through: { attributes: ['role', 'contribution_percentage'] }
      }]
    }]
  });
};

module.exports = Category;

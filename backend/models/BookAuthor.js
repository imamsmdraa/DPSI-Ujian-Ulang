const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model BookAuthor (Junction Table)
 * Relasi: belongsTo dengan Book dan Author
 * Untuk implementasi Many-to-Many relationship antara Book dan Author
 */
const BookAuthor = sequelize.define('BookAuthor', {
  book_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'book',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  author_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'author',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('Primary Author', 'Co-Author', 'Editor', 'Translator'),
    allowNull: false,
    defaultValue: 'Primary Author',
    validate: {
      isIn: {
        args: [['Primary Author', 'Co-Author', 'Editor', 'Translator']],
        msg: 'Role harus salah satu dari: Primary Author, Co-Author, Editor, Translator'
      }
    }
  },
  contribution_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100.00,
    validate: {
      min: {
        args: [0.01],
        msg: 'Persentase kontribusi harus lebih dari 0'
      },
      max: {
        args: [100.00],
        msg: 'Persentase kontribusi tidak boleh lebih dari 100'
      },
      isDecimal: {
        msg: 'Persentase kontribusi harus berupa angka desimal'
      }
    }
  }
}, {
  tableName: 'book_author',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Tidak perlu updated_at untuk junction table
  indexes: [
    {
      fields: ['book_id'],
      name: 'idx_book_author_book'
    },
    {
      fields: ['author_id'],
      name: 'idx_book_author_author'
    }
  ],
  hooks: {
    beforeCreate: async (bookAuthor) => {
      // Validasi bahwa total kontribusi untuk satu buku tidak melebihi 100%
      const existingContributions = await BookAuthor.findAll({
        where: {
          book_id: bookAuthor.book_id
        }
      });
      
      const totalExisting = existingContributions.reduce((sum, item) => {
        return sum + parseFloat(item.contribution_percentage);
      }, 0);
      
      const newTotal = totalExisting + parseFloat(bookAuthor.contribution_percentage);
      
      if (newTotal > 100) {
        throw new Error(`Total kontribusi akan melebihi 100%. Saat ini: ${totalExisting}%, ditambah: ${bookAuthor.contribution_percentage}%`);
      }
    },
    beforeUpdate: async (bookAuthor) => {
      // Validasi saat update
      const existingContributions = await BookAuthor.findAll({
        where: {
          book_id: bookAuthor.book_id,
          author_id: { [sequelize.Sequelize.Op.ne]: bookAuthor.author_id }
        }
      });
      
      const totalOthers = existingContributions.reduce((sum, item) => {
        return sum + parseFloat(item.contribution_percentage);
      }, 0);
      
      const newTotal = totalOthers + parseFloat(bookAuthor.contribution_percentage);
      
      if (newTotal > 100) {
        throw new Error(`Total kontribusi akan melebihi 100%. Kontribusi author lain: ${totalOthers}%, yang akan diset: ${bookAuthor.contribution_percentage}%`);
      }
    }
  }
});

// Instance methods
BookAuthor.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Format contribution percentage untuk display
  if (values.contribution_percentage) {
    values.formatted_contribution = `${values.contribution_percentage}%`;
  }
  
  return values;
};

// Class methods
BookAuthor.findByBook = function(bookId) {
  return this.findAll({
    where: {
      book_id: bookId
    },
    include: [
      {
        model: sequelize.models.Author,
        as: 'author'
      }
    ]
  });
};

BookAuthor.findByAuthor = function(authorId) {
  return this.findAll({
    where: {
      author_id: authorId
    },
    include: [
      {
        model: sequelize.models.Book,
        as: 'book',
        include: [{
          model: sequelize.models.Category,
          as: 'category'
        }]
      }
    ]
  });
};

BookAuthor.getCollaborativeBooks = function() {
  return this.findAll({
    attributes: [
      'book_id',
      [sequelize.fn('COUNT', sequelize.col('author_id')), 'author_count']
    ],
    group: ['book_id'],
    having: sequelize.literal('author_count > 1'),
    include: [{
      model: sequelize.models.Book,
      as: 'book',
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
    }]
  });
};

BookAuthor.validateTotalContribution = async function(bookId) {
  const contributions = await this.findAll({
    where: {
      book_id: bookId
    }
  });
  
  const total = contributions.reduce((sum, item) => {
    return sum + parseFloat(item.contribution_percentage);
  }, 0);
  
  return {
    total: total,
    isValid: total <= 100,
    remaining: 100 - total
  };
};

module.exports = BookAuthor;

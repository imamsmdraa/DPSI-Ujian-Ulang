const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Konfigurasi database connection
// Menggunakan SQLite untuk demo (mudah setup tanpa MySQL server)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database', 'bookstore.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true, // Enable createdAt and updatedAt
    underscored: true, // Use snake_case untuk kolom database
    freezeTableName: true, // Use model name as table name
  },
});

// Jika ingin menggunakan MySQL, uncomment kode berikut dan comment SQLite di atas:
/*
const sequelize = new Sequelize(
  process.env.DB_NAME || 'bookstore_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+07:00', // Timezone Indonesia
    define: {
      timestamps: true, // Enable createdAt and updatedAt
      underscored: true, // Use snake_case untuk kolom database
      freezeTableName: true, // Use model name as table name
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
*/

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };

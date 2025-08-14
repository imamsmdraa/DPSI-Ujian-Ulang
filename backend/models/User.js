const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 100],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name',
      validate: {
        len: [2, 255],
        notEmpty: true
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['admin', 'user']]
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login'
    }
  }, {
    tableName: 'user',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['username'],
        name: 'uk_user_username'
      },
      {
        unique: true,
        fields: ['email'],
        name: 'uk_user_email'
      },
      {
        fields: ['role'],
        name: 'idx_user_role'
      },
      {
        fields: ['is_active'],
        name: 'idx_user_active'
      }
    ],
    hooks: {
      // Hash password sebelum create
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
        
        // Generate ID jika belum ada
        if (!user.id) {
          const count = await User.count();
          user.id = `USR${String(count + 1).padStart(3, '0')}`;
        }
      },
      
      // Hash password sebelum update jika password berubah
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.toJSON = function() {
    const user = { ...this.get() };
    delete user.password; // Never send password in response
    return user;
  };

  User.prototype.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
  };

  // Class methods
  User.findByUsernameOrEmail = async function(usernameOrEmail) {
    return await this.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      }
    });
  };

  User.createUser = async function(userData) {
    return await this.create(userData);
  };

  User.findActiveUser = async function(id) {
    return await this.findOne({
      where: {
        id,
        isActive: true
      }
    });
  };

  return User;
};

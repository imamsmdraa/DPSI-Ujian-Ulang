// Script untuk menambah user default untuk testing authentication
const { sequelize } = require('./config/database');
const UserModel = require('./models/User');

// Initialize User model
const User = UserModel(sequelize);

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...');

    // Sync User table first
    await User.sync();
    console.log('✅ User table synced');

    // Cek apakah sudah ada user
    const userCount = await User.count();
    
    if (userCount > 0) {
      console.log('📊 Users already exist, skipping seed');
      return;
    }

    // Data user default
    const defaultUsers = [
      {
        id: 'USR001',
        username: 'admin',
        email: 'admin@bookstore.com',
        password: 'admin123',
        fullName: 'Administrator',
        role: 'admin',
        isActive: true
      },
      {
        id: 'USR002', 
        username: 'testuser',
        email: 'user@bookstore.com',
        password: 'user123',
        fullName: 'Test User',
        role: 'user',
        isActive: true
      },
      {
        id: 'USR003',
        username: 'johndoe',
        email: 'john.doe@example.com', 
        password: 'password123',
        fullName: 'John Doe',
        role: 'user',
        isActive: true
      }
    ];

    // Create users
    for (const userData of defaultUsers) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    console.log('✅ Users seeded successfully');

    // Display login credentials
    console.log('\n🔐 Default Login Credentials:');
    console.log('====================================');
    console.log('Admin Account:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Role: admin');
    console.log('');
    console.log('User Account:');
    console.log('  Username: testuser');
    console.log('  Password: user123');
    console.log('  Role: user');
    console.log('');
    console.log('Another User Account:');
    console.log('  Username: johndoe');
    console.log('  Password: password123');
    console.log('  Role: user');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedUsers;

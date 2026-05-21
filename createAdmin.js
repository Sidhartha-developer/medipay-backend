require('dotenv').config();
const mongoose = require('mongoose');

const Admin = require('./src/models/Admin');

async function seedAdmin() {
  try {

    await mongoose.connect(process.env.MONGODB_URI);

    await Admin.deleteMany({ email: 'admin@test.com' });

    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@test.com',
      password: '12345678',
      role: 'super_admin',
      isActive: true
    });

    console.log('✅ Admin created successfully');
    console.log(admin);

    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
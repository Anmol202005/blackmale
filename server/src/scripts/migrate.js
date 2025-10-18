require('dotenv').config();
const { sequelize } = require('../models');

async function migrate() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection successful');

    console.log('Running migrations...');
    await sequelize.sync({ force: false, alter: true });
    console.log('Migrations completed successfully');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
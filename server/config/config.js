const dotenv = require('dotenv');

dotenv.config();
module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false
  },
  test: {
    url: process.env.DATABASE_TEST_URL,
    dialect: 'postgres',
    logging: false
  },
  production: {
    use_env_variable: process.env.DATABASE_URL
  }
};

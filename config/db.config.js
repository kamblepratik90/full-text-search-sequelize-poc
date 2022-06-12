const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config(
  process.env.NODE_ENV === 'test'
    ? { path: path.resolve(process.cwd(), '.env.test'), override: true }
    : {}
);

const DATABASE_URI = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST_PORT}/${process.env.DB_NAME}`;
console.log(`DATABASE_URI = ${DATABASE_URI}`);

const sequelize = new Sequelize(DATABASE_URI, {
  // logging: (...msg) => console.log(msg), // Displays all log function call parameters
  logging: false,
  // this goes to retry-as-promised for queries
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    name: 'query',
    backoffBase: 100,
    backoffExponent: 1.1,
    timeout: 60000,
    max: Infinity
  },
  keepDefaultTimezone: true, // to avoid timezone issues
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
    handleDisconnects: true,
    evict: 10000
  }
});

module.exports = {
  sequelize
};

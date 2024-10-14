const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
console.log(process.env.DATABASE_HOST);

const sequelize = new Sequelize(process.env.DATABASE_NAME,process.env.DATABASE_USER,process.env.DATABASE_PASS,{
    dialect:'mysql',
    host:process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
});

module.exports = sequelize;
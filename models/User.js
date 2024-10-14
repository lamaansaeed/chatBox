const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/database'); // Assuming you have a database configuration file
// const Expense = require('./Expense'); // Import Expense model
// const Order = require('./Order');
// const Income =require('./Income');

const User = sequelize.define('user', {
    userId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    premium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Users are not premium by default
    },
    
});
// User.associate = (models) => {
//     User.hasMany(models.Expense, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'expense' });
//     User.hasMany(models.Order, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'order' });
//     User.hasMany(models.Income,  {foreignKey:'userId',onDelete: 'CASCADE', as: 'income'})
// };

module.exports = User;
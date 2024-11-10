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
    userStatus:{
        type: DataTypes.ENUM('loggedIn','loggedOut'),
    }
    
});
User.associate = (models) => {
     User.hasMany(models.Message, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'message' });

      // User has many groups (through GroupUsers table)
    User.hasMany(models.GroupUser, { as:'groupuser', foreignKey: 'userId' });

    // A user can own many groups
    User.hasMany(models.Group, { as: 'groups', foreignKey: 'userId' });
};

module.exports = User;
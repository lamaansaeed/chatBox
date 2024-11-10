// models/Message.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Message = sequelize.define('Message', {
    messageId :{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        
        onDelete: 'CASCADE'
    }
});
Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: 'userId', as: 'usermessage' });
    Message.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });
};

module.exports = Message;

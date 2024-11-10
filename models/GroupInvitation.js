const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const GroupInvitation = sequelize.define('GroupInvitation', {
    groupInviteId:{
    type:DataTypes.INTEGER,
    allowNull: false,
    autoIncrement:true,
    primaryKey : true,
    },
    groupUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('requested', 'invited','banned'),
        allowNull:false,
    },
    
}, {
    timestamps: true
});

// Define associations within the model
GroupInvitation.associate = (models) => {
    // Belongs to User
    GroupInvitation.belongsTo(models.GroupUser, { foreignKey: 'groupUserId' });

};

module.exports = GroupInvitation;

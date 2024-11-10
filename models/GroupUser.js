const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const GroupUser = sequelize.define('GroupUser', {
    groupUserId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    role: {
        type: DataTypes.ENUM('owner', 'member','inprocess'),
        allowNull:false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Table name of the User model
            key: 'userId'
        },
        onDelete: 'CASCADE' // Optional: Automatically delete group memberships if the user is deleted
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'groups', // Table name of the Group model
            key: 'groupId'
        },
        onDelete: 'CASCADE' // Optional: Automatically delete group memberships if the group is deleted
    }
}, {
    timestamps: true
});

// Define associations within the model
GroupUser.associate = (models) => {
    // Belongs to User
    GroupUser.belongsTo(models.User, { foreignKey: 'userId' });

    // Belongs to Group
    GroupUser.belongsTo(models.Group, { foreignKey: 'groupId' });

    GroupUser.hasOne(models.GroupInvitation, {
        as: 'groupinvite', 
        foreignKey: 'groupUserId',
        onDelete: 'CASCADE' // Automatically delete invitations when GroupUser is deleted
    });
};

module.exports = GroupUser;

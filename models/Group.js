// models/group.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
    const Group = sequelize.define('Group', {
        groupId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false, // Group must have an owner
            references: {
                model: 'Users', // references the Users table
                key: 'userId'
            }
        }
    }, {
        timestamps: true
    });

    Group.associate = (models) => {
        Group.belongsToMany(models.User, { through: models.GroupUser, foreignKey: 'groupId' });
    Group.hasMany(models.GroupUser, { foreignKey: 'groupId', as: 'groupUsers' });
        
        // A group belongs to one owner (a user)
        Group.belongsTo(models.User, { as: 'usergroup', foreignKey: 'userId' });
        Group.hasMany(models.Message, { foreignKey: 'groupId', onDelete: 'CASCADE', as: 'messages' });
    };

    module.exports= Group;

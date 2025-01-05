'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Agents extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_Agents.belongsTo(models.User, {
        foreignKey: 'userId', // Matches the 'userId' in the migration
        as: 'users' 
      })
    }
  }
  User_Agents.init({
    agent: DataTypes.STRING,
    verified: DataTypes.DATE,
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'User_Agents',
  });
  return User_Agents;
};
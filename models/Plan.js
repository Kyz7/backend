const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  place: {
    type: DataTypes.JSON, // Store entire place object as JSON
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('place');
      return rawValue ? JSON.parse(JSON.stringify(rawValue)) : null;
    }
  },
  dateRange: {
    type: DataTypes.JSON, // Store date range as JSON
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('dateRange');
      return rawValue ? {
        from: rawValue.from ? new Date(rawValue.from) : null,
        to: rawValue.to ? new Date(rawValue.to) : null
      } : null;
    }
  },
  estimatedCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  weather: {
    type: DataTypes.STRING,
    allowNull: true
  },
  flight: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'plans',
  timestamps: true
});

// Associations
Plan.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Plan, {
  foreignKey: 'userId',
  as: 'plans'
});

module.exports = Plan;
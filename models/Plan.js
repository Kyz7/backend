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
    type: DataTypes.JSON,
    allowNull: false, // Ubah ke required
    validate: {
      notNull: {
        msg: 'Place data is required'
      },
      isValidPlace(value) {
        if (!value || !value.name) {
          throw new Error('Place must have a name');
        }
      }
    }
  },
  dateRange: {
    type: DataTypes.JSON,
    allowNull: false, // Ubah ke required
    validate: {
      notNull: {
        msg: 'Date range is required'
      },
      isValidDateRange(value) {
        if (!value || !value.from || !value.to) {
          throw new Error('Date range must have from and to dates');
        }
      }
    }
  },
  estimatedCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0
  },
  weather: {
    type: DataTypes.STRING,
    allowNull: true
  },
  flight: {
    type: DataTypes.JSON,
    allowNull: true
  },
  travelers: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      adults: 1,
      children: 0
    }
  }
}, {
  tableName: 'plans',
  timestamps: true,
  hooks: {
    beforeCreate: (plan, options) => {
      console.log('Before create hook - Plan data:', {
        userId: plan.userId,
        place: plan.place,
        dateRange: plan.dateRange,
        travelers: plan.travelers
      });
    },
    afterCreate: (plan, options) => {
      console.log('After create hook - Plan saved with ID:', plan.id);
    }
  }
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
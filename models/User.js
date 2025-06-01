const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'Username sudah digunakan'
    },
    validate: {
      len: {
        args: [3, 50],
        msg: 'Username harus 3-50 karakter'
      },
      is: {
        args: /^[a-zA-Z0-9_]+$/,
        msg: 'Username hanya boleh mengandung huruf, angka, dan underscore'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    // Hapus validasi length karena password sudah di-hash
    validate: {
      notEmpty: {
        msg: 'Password harus diisi'
      }
    }
  }
}, {
  tableName: 'users',
  timestamps: true, // Rekomendasikan untuk tracking created/updated
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['username']
    }
  ]
});

module.exports = User;
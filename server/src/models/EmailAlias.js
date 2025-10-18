const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailAlias = sequelize.define('EmailAlias', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  alias: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: process.env.TEMP_EMAIL_DOMAIN || 'tempmail.local'
  },
  fullEmail: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.alias}@${this.domain}`;
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastChecked: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'email_aliases',
  timestamps: true,
  indexes: [
    {
      fields: ['alias', 'domain']
    },
    {
      fields: ['expiresAt']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = EmailAlias;
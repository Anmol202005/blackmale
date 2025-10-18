const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailMessage = sequelize.define('EmailMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  aliasId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'email_aliases',
      key: 'id'
    }
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  recipient: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bodyText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bodyHtml: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  headers: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  receivedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'email_messages',
  timestamps: true,
  indexes: [
    {
      fields: ['aliasId']
    },
    {
      fields: ['receivedAt']
    },
    {
      fields: ['messageId']
    },
    {
      fields: ['sender']
    }
  ]
});

module.exports = EmailMessage;
const sequelize = require('../config/database');
const EmailAlias = require('./EmailAlias');
const EmailMessage = require('./EmailMessage');

EmailAlias.hasMany(EmailMessage, {
  foreignKey: 'aliasId',
  as: 'messages',
  onDelete: 'CASCADE'
});

EmailMessage.belongsTo(EmailAlias, {
  foreignKey: 'aliasId',
  as: 'alias'
});

module.exports = {
  sequelize,
  EmailAlias,
  EmailMessage
};
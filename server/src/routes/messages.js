const express = require('express');
const router = express.Router();
const { EmailAlias, EmailMessage } = require('../models');

router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const [alias, domain] = email.split('@');

    const emailAlias = await EmailAlias.findOne({
      where: { alias, domain, isActive: true }
    });

    if (!emailAlias) {
      return res.status(404).json({ error: 'Email alias not found' });
    }

    if (new Date() > emailAlias.expiresAt) {
      return res.status(410).json({ error: 'Email alias has expired' });
    }

    const messages = await EmailMessage.findAll({
      where: { aliasId: emailAlias.id },
      order: [['receivedAt', 'DESC']],
      limit: 50
    });

    res.json({
      email: emailAlias.fullEmail,
      expiresAt: emailAlias.expiresAt,
      messages: messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        senderName: msg.senderName,
        subject: msg.subject,
        bodyText: msg.bodyText,
        bodyHtml: msg.bodyHtml,
        receivedAt: msg.receivedAt,
        isRead: msg.isRead,
        attachments: msg.attachments
      }))
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.put('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await EmailMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.update({ isRead: true });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

router.get('/message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await EmailMessage.findByPk(messageId, {
      include: [{
        model: EmailAlias,
        as: 'alias'
      }]
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (new Date() > message.alias.expiresAt) {
      return res.status(410).json({ error: 'Email alias has expired' });
    }

    res.json({
      id: message.id,
      sender: message.sender,
      senderName: message.senderName,
      recipient: message.recipient,
      subject: message.subject,
      bodyText: message.bodyText,
      bodyHtml: message.bodyHtml,
      headers: message.headers,
      attachments: message.attachments,
      receivedAt: message.receivedAt,
      isRead: message.isRead
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

module.exports = router;
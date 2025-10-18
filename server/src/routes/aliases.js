const express = require('express');
const router = express.Router();
const { EmailAlias, EmailMessage } = require('../models');
const { generateRandomAlias } = require('../services/aliasGenerator');
const mailcowService = require('../services/mailcowService');
const mailhogService = require('../services/mailhogService');

router.post('/generate', async (req, res) => {
  try {
    const alias = generateRandomAlias();
    const domain = process.env.TEMP_EMAIL_DOMAIN || 'tempmail.local';
    const lifetimeMinutes = parseInt(process.env.EMAIL_LIFETIME_MINUTES) || 10;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + lifetimeMinutes);

    const emailAlias = await EmailAlias.create({
      alias,
      domain,
      expiresAt
    });

    if (process.env.USE_MAILHOG !== 'true') {
      try {
        await mailcowService.createAlias(emailAlias.fullEmail);
      } catch (mailcowError) {
        console.warn('Failed to create alias in Mailcow:', mailcowError.message);
      }
    }

    res.json({
      email: emailAlias.fullEmail,
      expiresAt: emailAlias.expiresAt,
      lifetimeMinutes
    });
  } catch (error) {
    console.error('Error generating alias:', error);
    res.status(500).json({ error: 'Failed to generate email alias' });
  }
});

router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const [alias, domain] = email.split('@');

    const emailAlias = await EmailAlias.findOne({
      where: { alias, domain },
      include: [{
        model: EmailMessage,
        as: 'messages',
        order: [['receivedAt', 'DESC']]
      }]
    });

    if (!emailAlias) {
      return res.status(404).json({ error: 'Email alias not found' });
    }

    if (!emailAlias.isActive || new Date() > emailAlias.expiresAt) {
      return res.status(410).json({ error: 'Email alias has expired' });
    }

    res.json({
      email: emailAlias.fullEmail,
      expiresAt: emailAlias.expiresAt,
      messages: emailAlias.messages || []
    });
  } catch (error) {
    console.error('Error fetching alias:', error);
    res.status(500).json({ error: 'Failed to fetch email alias' });
  }
});

router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const [alias, domain] = email.split('@');

    const emailAlias = await EmailAlias.findOne({
      where: { alias, domain }
    });

    if (!emailAlias) {
      return res.status(404).json({ error: 'Email alias not found' });
    }

    await EmailMessage.destroy({
      where: { aliasId: emailAlias.id }
    });

    await emailAlias.destroy();

    try {
      await mailcowService.deleteAlias(email);
    } catch (mailcowError) {
      console.warn('Failed to delete alias from Mailcow:', mailcowError.message);
    }

    res.json({ message: 'Email alias deleted successfully' });
  } catch (error) {
    console.error('Error deleting alias:', error);
    res.status(500).json({ error: 'Failed to delete email alias' });
  }
});

module.exports = router;
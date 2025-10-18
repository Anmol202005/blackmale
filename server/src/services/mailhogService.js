const axios = require('axios');
const { EmailAlias, EmailMessage } = require('../models');

class MailhogService {
  constructor() {
    this.apiUrl = process.env.MAILHOG_API_URL || 'http://mailhog:8025/api/v2';
    this.isEnabled = process.env.USE_MAILHOG === 'true';
  }

  async fetchMessages() {
    if (!this.isEnabled) {
      return [];
    }

    try {
      const response = await axios.get(`${this.apiUrl}/messages`);
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching messages from MailHog:', error.message);
      return [];
    }
  }

  async processMessages() {
    try {
      const messages = await this.fetchMessages();

      for (const msg of messages) {
        await this.processMessage(msg);
      }
    } catch (error) {
      console.error('Error processing MailHog messages:', error);
    }
  }

  async processMessage(mailhogMsg) {
    try {
      const recipients = mailhogMsg.To || [];

      for (const recipient of recipients) {
        const emailAddress = recipient.Mailbox + '@' + recipient.Domain;

        const [alias, domain] = emailAddress.split('@');

        const emailAlias = await EmailAlias.findOne({
          where: { alias, domain, isActive: true }
        });

        if (emailAlias) {
          const existingMessage = await EmailMessage.findOne({
            where: {
              messageId: mailhogMsg.ID,
              aliasId: emailAlias.id
            }
          });

          if (!existingMessage) {
            const sender = mailhogMsg.From;
            const senderEmail = sender.Mailbox + '@' + sender.Domain;

            await EmailMessage.create({
              aliasId: emailAlias.id,
              messageId: mailhogMsg.ID,
              sender: senderEmail,
              senderName: sender.Name || null,
              recipient: emailAddress,
              subject: this.getHeader(mailhogMsg, 'Subject') || '(No Subject)',
              bodyText: mailhogMsg.MIME?.Parts?.[0]?.Body || '',
              bodyHtml: mailhogMsg.MIME?.Parts?.[1]?.Body || '',
              headers: this.convertHeaders(mailhogMsg.Content?.Headers || {}),
              attachments: [],
              receivedAt: new Date(mailhogMsg.Created)
            });

            console.log(`Stored MailHog message for ${emailAddress}: ${this.getHeader(mailhogMsg, 'Subject')}`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing MailHog message:', error);
    }
  }

  getHeader(msg, headerName) {
    const headers = msg.Content?.Headers || {};
    const header = headers[headerName];
    return Array.isArray(header) ? header[0] : header;
  }

  convertHeaders(headers) {
    const converted = {};
    for (const [key, value] of Object.entries(headers)) {
      converted[key.toLowerCase()] = Array.isArray(value) ? value[0] : value;
    }
    return converted;
  }

  async deleteMessage(messageId) {
    if (!this.isEnabled) {
      return;
    }

    try {
      await axios.delete(`${this.apiUrl}/messages/${messageId}`);
    } catch (error) {
      console.warn('Failed to delete message from MailHog:', error.message);
    }
  }

  async clearAllMessages() {
    if (!this.isEnabled) {
      return;
    }

    try {
      await axios.delete(`${this.apiUrl}/messages`);
      console.log('Cleared all MailHog messages');
    } catch (error) {
      console.warn('Failed to clear MailHog messages:', error.message);
    }
  }
}

module.exports = new MailhogService();
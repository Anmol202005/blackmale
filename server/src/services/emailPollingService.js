const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { EmailAlias, EmailMessage } = require('../models');
const { Op } = require('sequelize');

class EmailPollingService {
  constructor() {
    this.imap = null;
    this.isRunning = false;
    this.pollInterval = 5000; // 5 seconds
    this.pollTimer = null;

    this.imapConfig = {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASS,
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT) || 143,
      tls: process.env.IMAP_TLS === 'true',
      authTimeout: 3000,
      connTimeout: 10000,
      tlsOptions: {
        rejectUnauthorized: false
      }
    };
  }

  async connect() {
    return new Promise((resolve, reject) => {
      if (!this.imapConfig.user || !this.imapConfig.password || !this.imapConfig.host) {
        console.warn('IMAP configuration incomplete. Email polling disabled.');
        return resolve();
      }

      this.imap = new Imap(this.imapConfig);

      this.imap.once('ready', () => {
        console.log('IMAP connection ready');
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error('IMAP connection error:', err);
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('IMAP connection ended');
      });

      this.imap.connect();
    });
  }

  async disconnect() {
    if (this.imap && this.imap.state !== 'disconnected') {
      this.imap.end();
    }
  }

  async openInbox() {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
        } else {
          resolve(box);
        }
      });
    });
  }

  async fetchNewEmails() {
    try {
      if (!this.imap || this.imap.state !== 'authenticated') {
        await this.connect();
      }

      await this.openInbox();

      const activeAliases = await EmailAlias.findAll({
        where: {
          isActive: true,
          expiresAt: {
            [Op.gt]: new Date()
          }
        }
      });

      if (activeAliases.length === 0) {
        return;
      }

      return new Promise((resolve, reject) => {
        this.imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            resolve([]);
            return;
          }

          const fetch = this.imap.fetch(results, {
            bodies: '',
            markSeen: true
          });

          const emails = [];

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream, info) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) {
                  console.error('Error parsing email:', err);
                  return;
                }

                try {
                  await this.processEmail(parsed, activeAliases);
                  emails.push(parsed);
                } catch (error) {
                  console.error('Error processing email:', error);
                }
              });
            });
          });

          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
            reject(err);
          });

          fetch.once('end', () => {
            resolve(emails);
          });
        });
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  async processEmail(parsed, activeAliases) {
    try {
      const recipients = [
        ...(parsed.to || []),
        ...(parsed.cc || []),
        ...(parsed.bcc || [])
      ].map(addr => typeof addr === 'string' ? addr : addr.address);

      for (const recipient of recipients) {
        const matchingAlias = activeAliases.find(alias =>
          alias.fullEmail.toLowerCase() === recipient.toLowerCase()
        );

        if (matchingAlias) {
          const existingMessage = await EmailMessage.findOne({
            where: {
              messageId: parsed.messageId,
              aliasId: matchingAlias.id
            }
          });

          if (!existingMessage) {
            await EmailMessage.create({
              aliasId: matchingAlias.id,
              messageId: parsed.messageId,
              sender: parsed.from?.value?.[0]?.address || parsed.from?.text || 'unknown',
              senderName: parsed.from?.value?.[0]?.name || null,
              recipient: recipient,
              subject: parsed.subject || '(No Subject)',
              bodyText: parsed.text || '',
              bodyHtml: parsed.html || '',
              headers: parsed.headers || {},
              attachments: (parsed.attachments || []).map(att => ({
                filename: att.filename,
                contentType: att.contentType,
                size: att.size
              })),
              receivedAt: parsed.date || new Date()
            });

            console.log(`Stored email for ${recipient}: ${parsed.subject}`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing email:', error);
    }
  }

  async pollEmails() {
    try {
      await this.fetchNewEmails();
    } catch (error) {
      console.error('Email polling error:', error);

      await this.disconnect();
      setTimeout(() => {
        if (this.isRunning) {
          this.connect().catch(console.error);
        }
      }, 30000);
    }
  }

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log('Starting email polling service...');

    this.connect().then(() => {
      this.pollTimer = setInterval(() => {
        this.pollEmails();
      }, this.pollInterval);
    }).catch((error) => {
      console.error('Failed to start email polling:', error);
    });
  }

  stop() {
    this.isRunning = false;

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    this.disconnect();
    console.log('Email polling service stopped');
  }
}

module.exports = new EmailPollingService();
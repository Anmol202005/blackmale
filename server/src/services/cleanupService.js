const cron = require('node-cron');
const { EmailAlias, EmailMessage } = require('../models');
const { Op } = require('sequelize');
const mailcowService = require('./mailcowService');

class CleanupService {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
    this.cleanupInterval = process.env.CLEANUP_INTERVAL || '*/5 * * * *'; // Every 5 minutes
  }

  async cleanupExpiredAliases() {
    try {
      console.log('Starting cleanup of expired aliases...');

      const expiredAliases = await EmailAlias.findAll({
        where: {
          [Op.or]: [
            { expiresAt: { [Op.lt]: new Date() } },
            { isActive: false }
          ]
        }
      });

      if (expiredAliases.length === 0) {
        console.log('No expired aliases to clean up');
        return;
      }

      let deletedCount = 0;
      let mailcowErrors = 0;

      for (const alias of expiredAliases) {
        try {
          console.log(`Cleaning up alias: ${alias.fullEmail}`);

          await EmailMessage.destroy({
            where: { aliasId: alias.id }
          });

          try {
            await mailcowService.deleteAlias(alias.fullEmail);
          } catch (mailcowError) {
            console.warn(`Failed to delete alias from Mailcow: ${alias.fullEmail}`, mailcowError.message);
            mailcowErrors++;
          }

          await alias.destroy();
          deletedCount++;

        } catch (error) {
          console.error(`Error cleaning up alias ${alias.fullEmail}:`, error);
        }
      }

      console.log(`Cleanup completed: ${deletedCount} aliases deleted`);
      if (mailcowErrors > 0) {
        console.warn(`${mailcowErrors} Mailcow deletion errors occurred`);
      }

    } catch (error) {
      console.error('Error during cleanup process:', error);
    }
  }

  async cleanupOldMessages() {
    try {
      const olderThan = new Date();
      olderThan.setHours(olderThan.getHours() - 24); // Delete messages older than 24 hours

      const deletedCount = await EmailMessage.destroy({
        where: {
          receivedAt: {
            [Op.lt]: olderThan
          }
        }
      });

      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old messages`);
      }
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
    }
  }

  async markExpiredAliasesAsInactive() {
    try {
      const [updatedCount] = await EmailAlias.update(
        { isActive: false },
        {
          where: {
            expiresAt: { [Op.lt]: new Date() },
            isActive: true
          }
        }
      );

      if (updatedCount > 0) {
        console.log(`Marked ${updatedCount} expired aliases as inactive`);
      }
    } catch (error) {
      console.error('Error marking expired aliases as inactive:', error);
    }
  }

  async performCleanup() {
    console.log('Starting scheduled cleanup...');

    await this.markExpiredAliasesAsInactive();
    await this.cleanupExpiredAliases();
    await this.cleanupOldMessages();

    console.log('Scheduled cleanup completed');
  }

  start() {
    if (this.isRunning) {
      console.log('Cleanup service is already running');
      return;
    }

    this.isRunning = true;

    this.cronJob = cron.schedule(this.cleanupInterval, async () => {
      await this.performCleanup();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.cronJob.start();

    console.log(`Cleanup service started with interval: ${this.cleanupInterval}`);

    setTimeout(async () => {
      await this.performCleanup();
    }, 10000);
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }

    console.log('Cleanup service stopped');
  }

  async forceCleanup() {
    console.log('Performing forced cleanup...');
    await this.performCleanup();
  }
}

module.exports = new CleanupService();
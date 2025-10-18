const axios = require('axios');

class MailcowService {
  constructor() {
    this.apiUrl = process.env.MAILCOW_API_URL;
    this.apiKey = process.env.MAILCOW_API_KEY;
    this.domain = process.env.TEMP_EMAIL_DOMAIN || 'tempmail.local';

    if (!this.apiUrl || !this.apiKey) {
      console.warn('Mailcow API URL or API key not configured. Mailcow integration will be disabled.');
    }
  }

  async makeRequest(method, endpoint, data = null) {
    if (!this.apiUrl || !this.apiKey) {
      throw new Error('Mailcow API not configured');
    }

    try {
      const config = {
        method,
        url: `${this.apiUrl}${endpoint}`,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Mailcow API error:', error.response?.data || error.message);
      throw new Error(`Mailcow API request failed: ${error.response?.status || error.message}`);
    }
  }

  async createAlias(email) {
    const [alias, domain] = email.split('@');

    const aliasData = {
      address: email,
      goto: `catchall@${domain}`,
      active: 1
    };

    return this.makeRequest('POST', '/add/alias', aliasData);
  }

  async deleteAlias(email) {
    return this.makeRequest('POST', '/delete/alias', [email]);
  }

  async getAliases() {
    return this.makeRequest('GET', `/get/alias/all/${this.domain}`);
  }

  async createCatchAllAlias() {
    const catchAllEmail = `catchall@${this.domain}`;

    try {
      const aliasData = {
        address: catchAllEmail,
        goto: catchAllEmail,
        active: 1
      };

      return this.makeRequest('POST', '/add/alias', aliasData);
    } catch (error) {
      console.warn('Failed to create catch-all alias:', error.message);
    }
  }

  async ensureDomainExists() {
    try {
      const domains = await this.makeRequest('GET', '/get/domain/all');
      const domainExists = domains.some(d => d.domain_name === this.domain);

      if (!domainExists) {
        console.warn(`Domain ${this.domain} not found in Mailcow. Please add it manually.`);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Failed to check domain existence:', error.message);
      return false;
    }
  }

  async init() {
    try {
      const domainExists = await this.ensureDomainExists();
      if (domainExists) {
        await this.createCatchAllAlias();
        console.log('Mailcow service initialized successfully');
      }
    } catch (error) {
      console.warn('Failed to initialize Mailcow service:', error.message);
    }
  }
}

module.exports = new MailcowService();
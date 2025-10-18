# TempMail - Temporary Email Service

A simple temporary email service built with Node.js, Express, React, and PostgreSQL. Generate temporary email addresses that automatically expire and receive emails for testing purposes.

## Features

- **Generate temporary email addresses** with customizable expiration times
- **Receive and view emails** in real-time with auto-refresh
- **Automatic cleanup** of expired emails and aliases
- **Mailcow integration** for email alias management
- **IMAP polling** for real-time email fetching
- **Rate limiting** to prevent abuse
- **Responsive UI** with Tailwind CSS

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: PostgreSQL
- **Mail Server**: Mailcow (Docker-based)
- **Email Processing**: IMAP polling + Mailparser
- **Caching**: Redis

## Project Structure

```
blackmail/
├── docker-compose.yml          # Docker services configuration
├── server/                     # Backend API
│   ├── src/
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── config/            # Configuration files
│   │   └── scripts/           # Database scripts
│   ├── package.json
│   └── Dockerfile
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── Dockerfile
└── README.md
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd blackmail
```

### 2. Configure Environment Variables

Create environment files or modify the docker-compose.yml with your settings:

**Backend Environment Variables:**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://tempmail:tempmail123@postgres:5432/tempmail
REDIS_URL=redis://redis:6379
MAILCOW_API_URL=http://mailcow:8080/api/v1
MAILCOW_API_KEY=your-mailcow-api-key
IMAP_HOST=mailcow
IMAP_PORT=143
IMAP_USER=admin@tempmail.local
IMAP_PASS=admin123
TEMP_EMAIL_DOMAIN=tempmail.local
EMAIL_LIFETIME_MINUTES=10
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Mailcow Web UI**: http://localhost:8080

## Configuration

### Mailcow Setup

1. Access Mailcow admin panel at http://localhost:8080
2. Create the domain `tempmail.local` (or your configured domain)
3. Generate an API key in Mailcow admin settings
4. Update the `MAILCOW_API_KEY` in docker-compose.yml

### Email Lifetime

Configure how long temporary emails last by setting `EMAIL_LIFETIME_MINUTES` (default: 10 minutes).

### Cleanup Schedule

The cleanup service runs every 5 minutes by default. Modify the cron expression in `cleanupService.js` to change this.

## API Endpoints

### Aliases
- `POST /api/aliases/generate` - Generate a new temporary email
- `GET /api/aliases/:email` - Get alias info and messages
- `DELETE /api/aliases/:email` - Delete alias manually

### Messages
- `GET /api/mail/:email` - Get all messages for an email
- `GET /api/mail/message/:messageId` - Get specific message
- `PUT /api/mail/:messageId/read` - Mark message as read

### System
- `GET /health` - Health check
- `GET /api/stats` - Service statistics

## Development

### Backend Development

```bash
cd server
npm install
npm run dev
```

### Frontend Development

```bash
cd client
npm install
npm run dev
```

### Database Operations

```bash
# Run migrations
docker-compose exec backend npm run db:migrate

# Access PostgreSQL
docker-compose exec postgres psql -U tempmail -d tempmail
```

## Features in Detail

### Email Generation
- Generates random aliases using adjectives + nouns + numbers
- Configurable domain support
- Automatic expiration scheduling

### Email Processing
- IMAP polling every 5 seconds for new emails
- Automatic parsing of text and HTML content
- Attachment metadata storage
- Duplicate message prevention

### Auto-cleanup
- Expired aliases and messages are automatically deleted
- Configurable cleanup intervals
- Mailcow alias synchronization

### Security
- Rate limiting on alias generation
- CORS protection
- Input validation and sanitization
- Secure headers with Helmet

## Troubleshooting

### Common Issues

1. **Mailcow not receiving emails**
   - Ensure DNS is configured for your domain
   - Check Mailcow logs: `docker-compose logs mailcow`

2. **IMAP connection failures**
   - Verify IMAP credentials in environment variables
   - Check Mailcow IMAP service status

3. **Database connection errors**
   - Ensure PostgreSQL is running: `docker-compose ps postgres`
   - Check database credentials

### Logs

View service logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mailcow
```

## Production Deployment

### Security Considerations

1. **Change default passwords** for all services
2. **Use proper SSL certificates** for HTTPS
3. **Configure firewall rules** to limit access
4. **Set up monitoring** and log aggregation
5. **Regular backups** of database and configuration

### Performance Tuning

1. **Increase database connection pools** for high load
2. **Configure Redis for session storage**
3. **Set up load balancing** for multiple backend instances
4. **Optimize cleanup intervals** based on usage

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review Docker logs
- Create an issue in the repository
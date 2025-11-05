# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

1. **DO NOT** open a public issue
2. Email security@pathfinder.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. Allow up to 48 hours for initial response
4. Work with us to resolve the issue before public disclosure

## Security Best Practices

When using Pathfinder:

1. **Never commit secrets** - Use environment variables
2. **Keep dependencies updated** - Run `npm audit` regularly
3. **Use strong secrets** - Generate with `openssl rand -base64 32`
4. **Enable 2FA** - For all service accounts
5. **Review permissions** - Principle of least privilege
6. **Monitor logs** - Watch for suspicious activity

## Known Security Considerations

### API Keys
- All API keys should be stored in `.env` files
- Never commit `.env` files to version control
- Rotate keys regularly in production

### Database
- Use SSL/TLS for database connections in production
- Implement connection pooling limits
- Regular backups with encryption

### Authentication
- Clerk provides secure authentication
- DISABLE_AUTH should only be used in development
- Implement rate limiting on auth endpoints

## Security Updates

Security updates will be released as patch versions and documented in CHANGELOG.md with a `[SECURITY]` prefix.

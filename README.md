# Pathfinder - Internship Discovery & Outreach Platform

![Build Status](https://github.com/ebailine/EthanTestProject/workflows/Test%20and%20Build/badge.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.17.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

> Transform your internship search from black hole applications to strategic, research-backed outreach.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

---

Pathfinder aggregates internship opportunities across the web and helps students make effective, evidence-based outreach to hiring contacts.

## 🎯 Mission

Transform the internship search from sending applications into black holes to making strategic, research-backed outreach that gets responses.

## ✨ Features

### Discovery Module
- **Aggregated Opportunities**: Pull from 50+ sources including Greenhouse, Lever, and government portals
- **Smart Filtering**: Filter by major, location, pay, remote work, visa sponsorship, and more
- **Fresh Data**: Real-time verification and freshness indicators
- **ATS Integration**: Direct links to application systems

### Outreach Module
- **Company Research**: Automated research into companies, teams, and recent initiatives
- **Contact Finding**: 5 verified contacts per job with email validation
- **Evidence-Based Emails**: 5 personalized emails citing concrete company facts
- **Approval Workflow**: Review and edit all content before sending from your email

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   n8n Workflows  │    │   External      │
│   (Next.js)     │◄──►│   (Automation)   │◄──►│   APIs/Services │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Typesense      │    │   Email Services│
│   (Database)    │    │   (Search)       │    │   (Gmail/Outlook)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### One-Command Setup

Clone and run the setup script - it handles everything automatically:

```bash
git clone https://github.com/ebailine/EthanTestProject.git
cd EthanTestProject
./setup.sh
```

That's it! The setup script will:
- ✅ Check prerequisites (Node.js, Docker)
- ✅ Start all services with health checks
- ✅ Install all dependencies automatically
- ✅ Set up database with proper permissions
- ✅ Seed 50+ sample jobs for testing
- ✅ Verify everything is working

### Start the Application

```bash
npm run dev
```

The application will be available at:
- **Main App**: http://localhost:3000
- **Job Search**: http://localhost:3000/jobs
- **n8n Dashboard**: http://localhost:5678
- **Typesense Dashboard**: http://localhost:8108

### Test Everything

```bash
./scripts/test.sh
```

### Clean Reset (if needed)

```bash
./cleanup.sh
./setup.sh
```

### Having Issues?

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions to common problems.

---

## 🔧 Common Issues & Solutions

### Build Error: Module not found 'lucide-react'
**Solution**: This is already fixed in the repository. If you still see it:
```bash
cd app && npm install lucide-react && cd ..
```

### Build Error: Cannot find module '@tailwindcss/typography'
**Solution**: This is already fixed in the repository. If you still see it:
```bash
cd app && npm install @tailwindcss/forms @tailwindcss/typography && cd ..
```

### Database Connection Failed
**Solution**: Ensure Docker is running and services are healthy:
```bash
docker-compose ps  # Check status
docker-compose logs postgres  # Check logs
docker-compose restart postgres  # Restart if needed
```

### Port Already in Use
**Solution**: Check what's using the port and stop it:
```bash
lsof -i :3000  # Check port 3000
kill -9 <PID>  # Kill the process
# Or use a different port: PORT=3001 npm run dev
```

### Permission Denied (Database)
**Solution**: Reset the database completely:
```bash
./cleanup.sh
./setup.sh
```

### npm install fails with peer dependency errors
**Solution**: The package.json has been updated to resolve conflicts:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

For more issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) and [TESTING_GUIDE.md](TESTING_GUIDE.md).

---

## 📁 Project Structure

```
pathfinder/
├── app/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # Shared utilities
│   │   └── types/        # TypeScript definitions
│   └── prisma/           # Database schema and migrations
├── ingestion/             # Job data collection service
│   └── src/
│       ├── connectors/   # ATS and job board integrations
│       └── normalizer.ts # Job deduplication and normalization
├── flows/                # n8n workflow definitions
├── llm-prompts/          # Reusable LLM prompt templates
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/pathfinder

# Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Email Services
GMAIL_CLIENT_ID=your_google_client_id
OUTLOOK_CLIENT_ID=your_microsoft_client_id

# LLM Services
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key

# Search
TYPESENSE_API_KEY=your_typesense_key
```

### Database Setup

The application uses PostgreSQL as the primary database. The schema includes:

- **companies**: Company information and metadata
- **jobs**: Internship listings with detailed attributes
- **sources**: Research content and evidence
- **moments**: Extracted insights for outreach
- **contacts**: Verified hiring contacts
- **users**: Student profiles and preferences
- **outreach_***: Outreach workflow and tracking

## 🔌 Integrations

### Job Sources
- **Greenhouse**: ATS job board scraping
- **Lever**: ATS job board scraping
- **Government Portals**: USAJOBS, NASA internships, etc.
- **Company Career Pages**: Direct scraping for large employers
- **CSV Curation**: Manual high-quality job imports

### Email Providers
- **Gmail**: OAuth integration for draft creation and sending
- **Outlook**: Microsoft Graph API integration
- **SMTP**: For custom domain email accounts

### LLM Services
- **Claude**: Company research and moment extraction
- **OpenAI**: Email drafting and personalization

## 📊 Monitoring & Analytics

### Key Metrics
- **Discovery**: Job freshness, data completeness, source coverage
- **Outreach**: Contact accuracy, email response rates, meeting bookings
- **User**: Weekly active users, outreach campaigns per user
- **Technical**: Workflow success rates, API response times

### Tools
- **PostHog**: Product analytics and user behavior
- **Sentry**: Error tracking and performance monitoring
- **Custom Dashboard**: Real-time metrics and alerting

## 🔒 Security & Privacy

### Data Protection
- All sensitive data encrypted at rest (AES-256)
- Resume files stored in encrypted S3-compatible storage
- Email communication via HTTPS only
- Database connections via SSL

### Privacy Controls
- Explicit approval required for all email sending
- Students review and edit all content before sending
- Easy opt-out and data deletion options
- Compliant with GDPR and CCPA

## 🧪 Development

### Running Tests
```bash
./scripts/test.sh        # Comprehensive health check and testing
npm run test             # Run unit tests (if available)
npm run typecheck        # TypeScript checking
```

### Code Quality
```bash
npm run lint             # ESLint checking
npm run typecheck        # TypeScript checking
npm run format           # Prettier formatting
```

### Database Operations
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed development data
```

## 📈 Roadmap

### Phase 1: MVP (Weeks 1-8)
- [x] Basic job aggregation from 3-5 sources
- [x] Search and discovery UI
- [x] Company research workflow
- [x] Contact finding and verification
- [x] Email drafting and approval system

### Phase 2: Enhanced Features (Weeks 9-12)
- [ ] Podcast/video transcript integration
- [ ] Advanced contact diversification
- [ ] Mobile-responsive design
- [ ] Analytics dashboard
- [ ] University partnerships

### Phase 3: Scale & Growth
- [ ] 50+ job source integrations
- [ ] AI-powered job matching
- [ ] Resume optimization tools
- [ ] Interview preparation features
- [ ] Enterprise university features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: hello@pathfinder.com
- **Documentation**: https://docs.pathfinder.com
- **API Docs**: https://developers.pathfinder.com
- **Community**: https://discord.gg/pathfinder

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), and [n8n](https://n8n.io/)
- Icons by [Lucide](https://lucide.dev/)
- Design inspiration from modern ATS and career platforms

---

**Made with ❤️ for students everywhere**
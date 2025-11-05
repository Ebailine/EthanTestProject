# Contributing to Pathfinder

Thank you for your interest in contributing to Pathfinder! This document provides guidelines and instructions for contributing.

## Code of Conduct

We expect all contributors to be respectful and professional. Please be kind and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/ebailine/EthanTestProject/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing [Issues](https://github.com/ebailine/EthanTestProject/issues) for similar suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our coding standards
4. Write/update tests as needed
5. Run tests: `npm test`
6. Run linting: `npm run lint`
7. Run type checking: `npm run typecheck`
8. Commit with conventional commits: `feat: add new feature`
9. Push to your fork: `git push origin feature/your-feature-name`
10. Create a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/EthanTestProject.git
cd EthanTestProject

# Run setup
./setup.sh

# Start development
npm run dev
```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Use interfaces over types when possible

### React/Next.js
- Use functional components with hooks
- Follow Next.js 14 best practices
- Use Server Components by default, Client Components when needed

### Styling
- Use Tailwind CSS utility classes
- Follow the existing design system in `globals.css`
- Keep components responsive

### Testing
- Write tests for new features
- Maintain test coverage above 70%
- Use React Testing Library for component tests

### Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test changes
- `refactor:` Code refactoring
- `style:` Formatting changes
- `chore:` Maintenance tasks

## Project Structure

```
pathfinder/
├── app/                 # Next.js frontend
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   └── lib/        # Utilities
│   └── prisma/         # Database schema
├── ingestion/          # Job collection service
├── flows/              # n8n workflows
└── docs/               # Documentation
```

## Questions?

Join our [Discord](https://discord.gg/pathfinder) or open a [Discussion](https://github.com/ebailine/EthanTestProject/discussions).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

<img width="2752" height="1536" alt="image-1778566617722" src="https://github.com/user-attachments/assets/1ca082c3-6b6a-40f5-b3ef-cab424c97c11" />

<img width="2752" height="1536" alt="image-1778550826966" src="https://github.com/user-attachments/assets/1736bafc-6c9e-4c72-bb52-4db328bd9174" />


# Career-Ops: AI-Native Career Management Platform

An intelligent job application automation and career orchestration system featuring:

- **Kanban/Swimlane Dashboard** with 14-stage job pipeline
- **Autonomous Agent Visibility** for resume tailoring, job matching, and interview prep
- **Real-time Synchronization** with WebSocket and optimistic UI updates
- **Interview Preparation Workspace** with AI-generated insights
- **Profile Intelligence System** for continuous enrichment
- **Production-Grade Infrastructure** with monitoring, logging, and incident response

## Quick Start

### Prerequisites
- Node.js 18.17.0 (use nvm: `nvm install 18.17.0`)
- Docker Desktop
- VSCode

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your settings

# Start local services
docker-compose up -d

# Run database migrations (when ready)
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── page.tsx         # Main dashboard
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── Kanban/          # Swimlane components
│   ├── InterviewPrep/   # Interview workspace
│   ├── SidePanel/       # Job detail panels
│   └── Timeline/        # Activity timeline
├── lib/                 # Shared utilities
│   ├── prisma.ts        # Database client
│   ├── redis.ts         # Redis client
│   ├── config.ts        # Configuration
│   └── auth.ts          # Authentication
├── hooks/               # Custom React hooks
└── types/               # TypeScript definitions

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Migration history

.vscode/
├── settings.json        # Workspace settings
├── extensions.json      # Recommended extensions
└── launch.json          # Debug configuration
```

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run start           # Run production build

# Code Quality
npm run lint            # ESLint check
npm run format          # Prettier format
npm run type-check      # TypeScript check

# Database
npm run db:push         # Sync schema
npm run db:migrate      # Create migration
npm run db:seed         # Seed test data
npm run db:studio       # Open Prisma Studio

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode
npm run test:e2e        # End-to-end tests
```

## Recommended VSCode Extensions

- **Prettier** - Code formatter
- **ESLint** - JavaScript/TypeScript linting
- **Prisma** - Database schema syntax highlighting
- **Tailwind CSS IntelliSense** - Utility class completion
- **GitLens** - Git integration and history

## Architecture

The system is built on:
- **Frontend**: Next.js 14, React 18, TypeScript, Zustand, React Query
- **Backend**: Express API routes, Prisma ORM, PostgreSQL
- **Real-time**: Socket.io, WebSocket event streaming
- **Cache**: Redis with pub/sub
- **Authentication**: NextAuth.js with OAuth
- **Infrastructure**: Docker, Terraform, AWS (ECS, RDS, ElastiCache)
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Tracing**: OpenTelemetry

## Documentation

- `ARCHITECTURE.md` - System design and event flows
- `API.md` - API endpoint documentation
- `CONTRIBUTING.md` - Development setup and guidelines

## License

ISC

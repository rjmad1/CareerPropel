# Local Development Setup Guide

## Prerequisites

### Required Software
- **Node.js** 18.17+ (LTS recommended)
- **npm** 9.0+ or **yarn** 1.22+
- **PostgreSQL** 14+ (or use Docker)
- **Git** 2.0+

### Optional but Recommended
- **Docker** & **Docker Compose** (for PostgreSQL)
- **VS Code** with extensions:
  - Prisma
  - TypeScript Vue Plugin
  - ESLint
  - Prettier
- **Postman** or **Insomnia** (for API testing)

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/rjmad1/CareerPropel.git
cd CareerPropel
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create `.env.local` in project root:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/career_ops"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"

# Claude API (for AI features)
CLAUDE_API_KEY="sk-ant-..."

# Optional: OAuth credentials
GITHUB_ID="..."
GITHUB_SECRET="..."
GOOGLE_ID="..."
GOOGLE_SECRET="..."

# Optional: File storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."
```

### 4. Database Setup

#### Option A: PostgreSQL with Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name career-propel-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=career_propel \
  -p 5432:5432 \
  -d postgres:14

# Update .env.local:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/career_propel"
```

#### Option B: Local PostgreSQL Installation

```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql
createdb career_propel

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb career_propel

# Windows
# Download and install from postgresql.org
# Create database via pgAdmin or psql
```

### 5. Prisma Migration

```bash
# Run migrations
npx prisma migrate dev --name initial

# Generate Prisma client
npx prisma generate

# (Optional) Seed database with mock data
# npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Server runs at `http://localhost:3000`

## Project Structure

```
CareerPropel/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── api/                        # API routes
│   │   │   ├── agent/                  # Agent endpoints
│   │   │   ├── profile/                # Profile endpoints
│   │   │   └── jobs/                   # Job endpoints
│   │   └── dashboard/                  # Dashboard page
│   ├── components/
│   │   ├── Agent/                      # Agent components
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentLog.tsx
│   │   │   └── AgentExecutionTimeline.tsx
│   │   ├── Profile/                    # Profile components
│   │   │   ├── ProfileCompleteness.tsx
│   │   │   ├── ProfileEditor.tsx
│   │   │   └── RecommendationPanel.tsx
│   │   ├── Kanban/                     # Kanban components
│   │   ├── CareerOS/                   # Integrated dashboard
│   │   └── ui/                         # Base UI components
│   ├── hooks/
│   │   ├── useAgentExecution.ts        # Agent execution hook
│   │   ├── useProfile.ts               # Profile data hook
│   │   └── useRealTime.ts              # WebSocket/polling hook
│   ├── lib/
│   │   ├── agent/                      # Agent service layer
│   │   │   └── agentService.ts
│   │   ├── profile/                    # Profile service layer
│   │   │   └── profileService.ts
│   │   ├── websocket/                  # WebSocket utilities
│   │   └── utils/                      # Utility functions
│   └── types/
│       ├── agent-configs.ts            # Agent configurations
│       └── profile.ts                  # Type definitions
├── prisma/
│   └── schema.prisma                   # Database schema
├── docs/                               # Documentation
│   ├── ARCHITECTURE.md                 # System architecture
│   ├── API_DESIGN.md                   # API documentation
│   ├── architecture/                   # Detailed architecture docs
│   ├── schema/                         # Schema documentation
│   └── development/                    # Developer guides
├── public/                             # Static assets
├── tests/                              # Test files
├── .env.local                          # Local environment variables
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── next.config.js                      # Next.js config
└── tailwind.config.js                  # Tailwind CSS config
```

## Common Commands

### Development
```bash
# Start dev server with hot reload
npm run dev

# Run TypeScript type-check
npm run type-check

# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Database
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (careful!)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio

# Generate Prisma client
npx prisma generate
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- componentName

# Generate coverage report
npm test -- --coverage
```

### Building
```bash
# Build for production
npm run build

# Start production build
npm start

# Analyze bundle size
npm run build -- --analyze
```

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js Dev",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Browser DevTools
- React DevTools browser extension
- Redux/Recoil DevTools (for state debugging)
- Network tab (for API calls)
- Console for logs

### Database Inspection
```bash
# Open Prisma Studio
npx prisma studio

# Query database via CLI
npx prisma db execute

# View migrations
npx prisma migrate status
```

## API Development

### Creating New API Route

1. **Create route file** `src/app/api/resource/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Implement logic
  const data = await fetchData();
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate input
  // Process data
  // Save to database
  
  return NextResponse.json(created, { status: 201 });
}
```

2. **Test with curl or Postman**:
```bash
curl -X GET http://localhost:3000/api/resource \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### API Documentation
- Refer to [API_DESIGN.md](../API_DESIGN.md) for complete endpoint reference
- Mock responses located in route files (marked with TODO comments)
- Database integration points documented with TODO markers

## Component Development

### Creating New Component

1. **Create component file** `src/components/Feature/Component.tsx`:
```typescript
import React from 'react';

interface ComponentProps {
  title: string;
  onAction: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button onClick={onAction} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Take Action
      </button>
    </div>
  );
};

export default Component;
```

2. **Add tests** `src/components/Feature/Component.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from './Component';

describe('Component', () => {
  it('renders with title', () => {
    render(<Component title="Test" onAction={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', async () => {
    const onAction = jest.fn();
    render(<Component title="Test" onAction={onAction} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

### Component Patterns
- See [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) for composition patterns
- Use TypeScript interfaces for props
- Implement error boundaries for error handling
- Add data-cy attributes for E2E testing

## Hook Development

### Creating Custom Hook

1. **Create hook file** `src/hooks/useFeature.ts`:
```typescript
import { useState, useCallback } from 'react';

export const useFeature = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateValue = useCallback(async (newValue: string) => {
    setLoading(true);
    setError(null);
    try {
      // Async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      setValue(newValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { value, updateValue, loading, error };
};
```

### Hook Patterns
- See [HOOK_PATTERNS.md](./HOOK_PATTERNS.md) for advanced patterns
- Use TypeScript for return types
- Handle cleanup in useEffect
- Implement error states
- Document cache strategies

## Testing

### Unit Tests
```bash
npm test -- src/lib/utils.test.ts
```

### Component Tests
```bash
npm test -- src/components/Feature/Component.test.tsx
```

### E2E Tests
```bash
npm run test:e2e
```

### Test File Template
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<Component />);
    const button = screen.getByRole('button', { name: /action/i });
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

## Performance Profiling

### React DevTools Profiler
1. Open DevTools → Profiler tab
2. Record component render timeline
3. Identify slow components
4. Optimize with useMemo, useCallback

### Lighthouse Audits
```bash
npm run build
npm start
# Open DevTools → Lighthouse
```

## Git Workflow

### Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push -u origin feature/new-feature

# Create pull request on GitHub
```

### Commit Message Format
```
feat: Add new feature
fix: Fix bug in component
docs: Update documentation
refactor: Restructure code
test: Add test coverage
chore: Update dependencies
```

## Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
# Or use different port
npm run dev -- -p 3001
```

**TypeScript errors:**
```bash
npm run type-check
# Fix errors or run type-check in watch mode
npm run type-check -- --watch
```

**Prisma client out of sync:**
```bash
npx prisma generate
```

**Database connection failed:**
```bash
# Check PostgreSQL is running
psql -U postgres -d career_propel

# Update DATABASE_URL in .env.local
```

**Node modules issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Getting Help

- Check [ARCHITECTURE.md](../ARCHITECTURE.md) for system overview
- Review [API_DESIGN.md](../API_DESIGN.md) for API contracts
- See [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) for component examples
- Check [HOOK_PATTERNS.md](./HOOK_PATTERNS.md) for hook examples

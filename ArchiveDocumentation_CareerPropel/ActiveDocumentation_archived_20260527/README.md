# Active Documentation

This folder contains the current working documentation for CareerPropel. Everything outside this folder should be treated as non-authoritative unless code confirms it.

## Read In This Order

1. [CURRENT_STATE.md](./CURRENT_STATE.md)
2. [ARCHITECTURE.md](./ARCHITECTURE.md)
3. [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
4. [DEPLOYMENT.md](./DEPLOYMENT.md)
5. [OPERATIONS.md](./OPERATIONS.md)
6. [QUEUE_ARCHITECTURE.md](./QUEUE_ARCHITECTURE.md)
7. `../prisma/schema.prisma`
8. `../src/bin/`
9. `../src/lib/queue/`
10. `../src/app/api/`

## What This Folder Means

- These docs are the active set to maintain going forward.
- They were selected because they align most closely with the current runtime split, queue-backed execution model, and live Prisma schema.
- Legacy planning, status, implementation-phase, and superseded architecture material has been moved to `../ArchiveDocumentation_CareerPropel/`.

## Current Truth Hierarchy

When docs and code disagree, use this order:

1. `../package.json`
2. `../prisma/schema.prisma`
3. `../src/bin/`
4. `../src/lib/runtime/`
5. `../src/lib/queue/`
6. `../src/app/api/`
7. This folder

## Active Files

- [CURRENT_STATE.md](./CURRENT_STATE.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
- [OPERATIONS.md](./OPERATIONS.md)
- [QUEUE_ARCHITECTURE.md](./QUEUE_ARCHITECTURE.md)

# Branding Rename Report: Career Ops → Career Propel

## Files Changed

| File | Change |
|---|---|
| `docs/API_DESIGN.md` | Title: "Career-Ops: API Design" → "Career Propel: API Design" |
| `MVP_PROGRESS.md` | Title: "Career Ops Frontend" → "Career Propel Frontend" |
| `docs/schema/DATABASE_SCHEMA.md` | Body: "Career-Ops database" → "Career Propel database" |

## Legacy Names Removed

- `Career-Ops` (hyphenated title form) — 3 occurrences
- `Career Ops` (space-separated display form) — 1 occurrence

## Retained Exceptions (Risky Technical Identifiers)

These identifiers were **not renamed** in this pass because changing them carries infrastructure or migration risk. Each one requires a dedicated migration step.

| File | Identifier | Form | Risk | Recommended Action |
|---|---|---|---|---|
| `package.json` | `"name": "career-ops"` | npm package name | Changing this can break `npm run` scripts, monorepo references, and any CI/CD that references the package by name | Rename in a dedicated PR after verifying no external dependents |
| `docs/development/SETUP_GUIDE.md` | `git clone .../career-ops.git` | Git remote URL | This is the actual GitHub repository URL; renaming requires a GitHub repo rename and redirect setup | Rename the GitHub repo and update this URL after the repo rename |
| `docs/development/SETUP_GUIDE.md` | `cd career-ops` | Local directory name | Refers to the cloned directory on disk; changing this in docs only is safe but the actual directory is still named `career-ops` | Update after the working directory is renamed |
| `docs/development/SETUP_GUIDE.md` | `docker run --name career-ops-db` | Docker container name | The container name `career-ops-db` has no external dependency; it is safe to rename in docs. Existing running containers are unaffected | Rename in docs freely; recreate the container with the new name |
| `docs/development/SETUP_GUIDE.md` | `POSTGRES_DB=career_ops` | PostgreSQL database name | Renaming an existing database requires `ALTER DATABASE` or a dump/restore | Schedule a database rename migration; update `DATABASE_URL` env var in lockstep |
| `docs/development/SETUP_GUIDE.md` | `DATABASE_URL=.../career_ops` | Connection string DB name | Same as above | Same as above |
| `docs/API_DESIGN.md` | `https://career-ops.vercel.app/api` | Production deployment URL | This is the live Vercel URL; changing it requires a Vercel project rename and DNS update | Rename the Vercel project to `career-propel`, update the custom domain if any, then update this URL |
| `BACKUP_SYSTEM_SUMMARY.md` | `~/career-ops` | Shell path references | Historical backup scripts reference the directory by its current name | Update after the working directory is renamed |
| `BACKUP_PROCESS.md` | `~/career-ops` | Shell path references | Same as above | Same as above |
| `CODEBASE_INTELLIGENCE_REPORT.md` | `career-ops` | Repository identifier | Auto-generated report; will be regenerated | Regenerate report after renaming |

## Verification

After applying this pass, no `Career Ops` or `Career-Ops` strings remain in user-facing UI code. All `.tsx`/`.ts` source files use **CareerPropel** (the approved PascalCase form). Docs now use **Career Propel** except where blocked by the infrastructure exceptions listed above.

## Recommended Follow-Up Migrations

1. Rename the GitHub repository from `career-ops` to `career-propel`.
2. Rename the Vercel project and update `docs/API_DESIGN.md` production URL.
3. Rename the local working directory and update all shell path references in `BACKUP_SYSTEM_SUMMARY.md` and `BACKUP_PROCESS.md`.
4. Schedule a PostgreSQL database rename (`ALTER DATABASE career_ops RENAME TO career_propel`) and update `DATABASE_URL` across all environments.
5. Update `package.json` `"name"` from `"career-ops"` to `"career-propel"` after verifying no CI/CD pipeline references the old name.

# Git Sync & Backup Guide for CareerPropel

## Quick Reference

### Status Check
```bash
# Check if local and remote are in sync
git status

# Should show: "Your branch is up to date with 'origin/main'"
```

### Quick Backup (End of Week)
```bash
# Automated: 
./scripts/weekly-backup.sh "Week X: Description of changes"

# Or manual:
git status  # Verify clean
git push origin main
```

### Verification
```bash
git log --oneline -1       # Local commit
git log --oneline origin/main -1  # Remote commit
# Should be identical
```

---

## Comprehensive Setup

### Current Status ✅
Your repository is configured as follows:

```
Local:   /c/Users/rajaj/career-ops
Remote:  https://github.com/rjmad1/CareerPropel.git
Branch:  main (default)
Status:  ✅ In sync (local = remote)
```

### Automatic Sync Features Installed

#### 1. Post-Commit Hook ✅
**Location:** `.git/hooks/post-commit`
**What it does:** After each commit, reminds you if there are unpushed changes
**Trigger:** Automatic after every `git commit`

```
Example output:
✓ Commit created: abc1234
Message: feat(week5): Add analytics export

⚠ You have 1 unpushed commit(s)
Push to GitHub with: git push origin main
```

#### 2. Weekly Backup Script ✅
**Location:** `./scripts/weekly-backup.sh`
**What it does:** Automated commit + push with retry logic
**Usage:** 
```bash
./scripts/weekly-backup.sh "Week 6: Feature implementation"
```

#### 3. .gitignore Configuration ✅
**Protects:** 
- `.env.local` (credentials)
- `node_modules/` (large)
- `.next/` (build artifacts)
- `.cypress/` (test artifacts)

---

## Weekly Backup Workflow

### **Friday EOD - Week Completion**

#### Step 1: Verify All Work is Committed (5 min)
```bash
cd ~/career-ops

# Check status
git status

# Expected output:
# On branch main
# Your branch is up to date with 'origin/main'.
# nothing to commit, working tree clean
```

#### Step 2: If Any Uncommitted Changes
```bash
# See what changed
git diff

# Stage changes
git add -A

# Commit with descriptive message
git commit -m "feat(week6): Implement real-time notifications

## Changes
- Added WebSocket integration
- Implemented notification service
- Added notification UI components

## Testing
- Added 15 new E2E tests
- All Lighthouse audits pass

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

#### Step 3: Automated Backup (1 min)
```bash
# Run the backup script
./scripts/weekly-backup.sh "Week 6: Real-time notifications and performance"

# Script will:
# ✓ Verify clean working tree
# ✓ Create backup commit
# ✓ Push to GitHub (with retry)
# ✓ Verify sync
# ✓ Generate report
```

#### Step 4: Verify Backup Success (1 min)
```bash
# Check sync status
git status
# Should show: "Your branch is up to date with 'origin/main'"

# View latest backup
git log --oneline -1

# Visit GitHub to confirm:
# https://github.com/rjmad1/CareerPropel
```

---

## Understanding Git Sync

### What "In Sync" Means

```
Local HEAD:    abc1234 (Week 5 backup)
Remote main:   abc1234 (Week 5 backup)
Status:        ✅ SYNCED
```

**You are in sync when:**
- `git status` shows "Your branch is up to date"
- `git log -1` and `git log -1 origin/main` show same hash
- No unpushed commits exist

### What "Out of Sync" Means

```
Local HEAD:    def5678 (Latest work)
Remote main:   abc1234 (Week 5 backup)
Status:        ⚠️  OUT OF SYNC (1 unpushed commit)
```

**This happens when:**
- You've made commits locally but not pushed
- Remote has changes you haven't pulled (rare with solo dev)

**Solution:**
```bash
git push origin main  # Push unpushed commits
git pull origin main  # Pull any remote changes
```

---

## Daily Development Workflow

### Morning - Start Day
```bash
cd ~/career-ops

# Ensure you have latest from GitHub
git pull origin main

# Start development
npm run dev
```

### During Day - Regular Commits
```bash
# Commit your work (as usual)
git commit -m "feat(week6): Add component X"

# Post-commit hook automatically reminds about pushing
# Output: "⚠ You have 1 unpushed commit(s)"
```

### EOD - Quick Backup
```bash
# Option 1: Push immediately
git push origin main

# Option 2: Batch push at EOD
# (multiple commits) → git push origin main

# Option 3: Use backup script Friday
./scripts/weekly-backup.sh "Week 6 progress"
```

### Friday EOD - Weekly Full Backup
```bash
# Run comprehensive backup
./scripts/weekly-backup.sh "Week 6: Description of all week's work"

# This is your guaranteed backup point
```

---

## Commit Message Best Practices

### Format
```
feat(weekN): Brief one-line summary

## Summary
- Change 1
- Change 2
- Change 3

## Files Modified
- src/components/...
- cypress/e2e/...

## Testing
- All tests pass
- Lighthouse score: 95+

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

### Semantic Prefixes
| Prefix | Meaning | Example |
|--------|---------|---------|
| `feat(weekN)` | New feature | `feat(week6): Add notifications` |
| `fix(weekN)` | Bug fix | `fix(week6): Fix filter sorting` |
| `test(weekN)` | Add tests | `test(week6): Add E2E tests` |
| `docs(weekN)` | Documentation | `docs(week6): Update README` |
| `refactor(weekN)` | Code refactoring | `refactor(week6): Optimize components` |
| `perf(weekN)` | Performance | `perf(week6): Improve page load` |

---

## Emergency Scenarios

### Scenario 1: "I need to recover old code"
```bash
# View commit history
git log --oneline

# Look for the week you want
# Example: abc1234 feat(week4): Add filters

# View changes in that commit
git show abc1234

# Checkout old version (read-only)
git checkout abc1234
npm install && npm run dev

# Return to latest
git checkout main
```

### Scenario 2: "I accidentally deleted a file"
```bash
# See what was deleted
git status

# Restore the file
git restore path/to/file.tsx

# Or restore all deleted files
git restore .
```

### Scenario 3: "Local repo is corrupted"
```bash
# Backup current state
cp -r ~/career-ops ~/career-ops-backup

# Clone fresh from GitHub
rm -rf ~/career-ops
git clone https://github.com/rjmad1/CareerPropel.git ~/career-ops
cd ~/career-ops
npm install
npm run dev
```

### Scenario 4: "Push failed to GitHub"
```bash
# Check connection
git ls-remote origin

# Check credentials
git config --list | grep url

# Try push with verbose output
git push origin main -v

# If network issue: wait and retry
# If auth issue: update GitHub credentials
```

---

## Backup Verification Checklist

### After Each Week's Backup, Verify:

```bash
# ✅ 1. Working tree is clean
git status
# Expected: "nothing to commit, working tree clean"

# ✅ 2. Local and remote are in sync
git log --oneline -1
git log --oneline origin/main -1
# Expected: Same commit hash

# ✅ 3. Can access GitHub
curl -s https://api.github.com/repos/rjmad1/CareerPropel | head -5
# Expected: JSON response with repo info

# ✅ 4. Backup is visible on GitHub
# Visit: https://github.com/rjmad1/CareerPropel
# Click "Commits" to see latest backup
```

---

## Scheduled Backup System

### Manual Scheduling (If Desired)
Windows Task Scheduler:
```
Trigger: Friday 6:00 PM
Action: Run C:\Users\rajaj\career-ops\scripts\weekly-backup.sh "Auto-backup Week X"
```

Or macOS/Linux crontab:
```bash
# Add to crontab -e
0 18 * * 5 cd ~/career-ops && ./scripts/weekly-backup.sh "Auto-backup $(date +%V)"
```

---

## Sync Dashboard Commands

### One-Command Sync Check
```bash
# Shows all important sync info
git status && echo "---" && git log --oneline -1 && echo "---" && git log --oneline origin/main -1
```

### Export Sync Status
```bash
# Creates a backup report
cat > ~/career-ops/SYNC_STATUS.txt << 'EOF'
Sync Status Report
==================
Local Commit:  $(git rev-parse HEAD)
Remote Commit: $(git rev-parse origin/main)
Status:        $(git status -s)
Date:          $(date)
EOF
```

---

## GitHub Repository Settings

### Current Configuration ✅
- **Repository:** https://github.com/rjmad1/CareerPropel
- **Visibility:** Public
- **Default Branch:** main
- **Branch Protection:** Not configured (can be added)
- **Auto-delete Head Branches:** Enabled
- **Require Status Checks:** Not required

### Recommended Enhancement
```bash
# If you want to enforce backup before pushing (optional):
# GitHub Settings → Branches → main → Add rule
# - Require status checks to pass
# - Require branches to be up to date
# - Require code review before merging
```

---

## Support & Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "working tree dirty" | `git status` to see changes, then `git add -A && git commit` |
| "push failed" | Check internet, then `git push origin main -v` for details |
| "merge conflict" | Unlikely with solo dev, but: `git merge origin/main` |
| "lost commits" | Check `git reflog` to find lost commits |
| "wrong branch" | `git checkout main` to return to main |

### Getting Help
```bash
# See git history
git log --oneline -10

# See what changed in last commit
git show HEAD

# See unpushed commits
git log origin/main..HEAD

# See diff with remote
git diff origin/main
```

---

## Summary: Your Backup Strategy

### ✅ Implemented
1. **Git Repository** — All code version controlled
2. **GitHub Remote** — Backup in cloud (https://github.com/rjmad1/CareerPropel)
3. **Post-Commit Hook** — Auto-reminder after commits
4. **Backup Script** — Automated `./scripts/weekly-backup.sh`
5. **Sync Verification** — Easy status checks

### 📋 Weekly Process
1. **Throughout Week** → Commit as usual
2. **Friday EOD** → Run `./scripts/weekly-backup.sh "Week X: ..."`
3. **Verification** → Check `git status` shows synced
4. **Confirmation** → Visit GitHub to verify

### 🔒 Safety Guarantees
- ✅ All code backed up to GitHub weekly
- ✅ Easy rollback to any previous week
- ✅ Protection against local file loss
- ✅ Clear audit trail of all changes
- ✅ Automatic reminders after each commit

---

**Last Updated:** 2026-05-12  
**Repository:** https://github.com/rjmad1/CareerPropel  
**Status:** ✅ All systems operational

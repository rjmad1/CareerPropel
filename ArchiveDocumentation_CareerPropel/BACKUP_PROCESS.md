# CareerPropel Weekly Backup Process

## Overview
This document outlines the automated and manual backup process for the CareerPropel frontend project. All changes are backed up to GitHub after each week's development cycle.

## Backup Strategy

### Current Status ✅
- **Local Repository:** In sync with GitHub
- **Remote Repository:** https://github.com/rjmad1/CareerPropel
- **Default Branch:** main
- **Backup Method:** Git commits + GitHub push

## Weekly Backup Workflow

### Step 1: End of Week Review (Friday EOD)
Before making your weekly backup, verify all changes are committed locally:

```bash
cd ~/career-propel
git status  # Should show "nothing to commit, working tree clean"
```

### Step 2: Weekly Backup Script (Automated)
Run the provided backup script to commit and push all changes:

```bash
# Make the script executable (first time only)
chmod +x ./scripts/weekly-backup.sh

# Run the backup
./scripts/weekly-backup.sh "Week 6: Feature implementation and integration"
```

**The script will:**
1. ✅ Verify working tree is clean
2. ✅ Check for uncommitted changes
3. ✅ Create a dated backup commit
4. ✅ Push to GitHub with automatic retry
5. ✅ Generate backup report

### Step 3: Manual Backup (Alternative)
If you prefer manual control:

```bash
cd ~/career-propel

# Review changes
git status
git diff

# Stage all changes
git add -A

# Create descriptive commit
git commit -m "feat(week6): [Your week's changes description]

## Summary
- Feature 1
- Feature 2
- Bug fixes

## Files Changed
- src/components/...
- cypress/e2e/...

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

## Commit Message Format

Use semantic versioning for clarity:

```
feat(weekN): Brief description

## Summary
- Key change 1
- Key change 2
- Key change 3

## Components Modified
- Component A
- Component B

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

### Commit Prefixes
- `feat(weekN)` — New features
- `fix(weekN)` — Bug fixes
- `test(weekN)` — Test additions
- `docs(weekN)` — Documentation
- `refactor(weekN)` — Code refactoring
- `perf(weekN)` — Performance improvements

## Backup Verification

After each backup, verify the push was successful:

```bash
# Check local and remote are in sync
git log --oneline -1
git log --oneline origin/main -1

# Should show identical commit hashes

# Or use status check
git status  # Should show "Your branch is up to date with 'origin/main'"
```

## Automated Backup Reminder

A git post-commit hook is installed that reminds you to push to GitHub:

```bash
# Hook location: .git/hooks/post-commit
# Runs automatically after each commit
# Reminds you to run: git push origin main
```

## Emergency Recovery

If you ever need to recover from a specific week:

```bash
# View commit history
git log --oneline

# Checkout a previous week's state
git checkout <commit-hash>

# Return to latest
git checkout main
```

## Weekly Checklist

### Before Week Ends
- [ ] All new code files are created
- [ ] All tests pass locally
- [ ] Lighthouse audit targets are met
- [ ] No uncommitted changes: `git status` shows clean tree
- [ ] Local and remote are synced

### During Backup
- [ ] Run backup script: `./scripts/weekly-backup.sh "Week X description"`
- [ ] Or manually commit and push
- [ ] Verify push succeeded: `git log --oneline -1` matches remote

### After Backup
- [ ] Verify GitHub shows latest commit
- [ ] Check GitHub Actions passed (if configured)
- [ ] Confirm all files are accessible on GitHub
- [ ] Document week's changes in CHANGELOG.md

## GitHub Repository Status

**Repository URL:** https://github.com/rjmad1/CareerPropel  
**Branch:** main  
**Visibility:** Public  
**Latest Backup:** Automated with each commit  

## Disaster Recovery

If the local repository becomes corrupted:

```bash
# Clone fresh copy from GitHub
cd ~
rm -rf career-propel-backup
git clone https://github.com/rjmad1/CareerPropel.git career-propel-backup
cd career-propel-backup
npm install
npm run dev
```

## Tips for Effective Backups

1. **Commit Frequently** — Don't wait until end of week
2. **Write Descriptive Messages** — Future you will thank you
3. **Push After Each Commit** — Don't accumulate unpushed changes
4. **Use Branches for Experiments** — Keep main stable
5. **Tag Release Points** — Mark milestones with git tags

## Automated Workflow (Advanced)

For truly hands-off backups, consider:

```bash
# Setup automatic daily push (if you have CI/CD)
# Or manual scheduled task:
# Every Friday 6PM: ./scripts/weekly-backup.sh "Auto-backup Week X"
```

## Support

If backup fails:
1. Check internet connection
2. Verify GitHub credentials: `git config --list`
3. Try manual push: `git push origin main -v` (verbose mode)
4. Check GitHub status: https://www.githubstatus.com
5. Review git error messages carefully

## Security Notes

- ✅ GitHub repository is backed up automatically
- ✅ SSH keys are used for authentication (secure)
- ✅ No credentials stored in commits
- ✅ .env files are in .gitignore (protected)
- ✅ Large binaries are excluded (node_modules ignored)

---

**Last Updated:** 2026-05-12  
**Backup Frequency:** Weekly (Friday EOD recommended)  
**GitHub Status:** ✅ In sync

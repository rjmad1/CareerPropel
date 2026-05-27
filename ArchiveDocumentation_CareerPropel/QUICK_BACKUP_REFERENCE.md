# CareerPropel - Weekly Backup Quick Reference

## TL;DR - Just Do This

### End of Week (Friday EOD)
```bash
cd ~/career-propel
./scripts/weekly-backup.sh "Week 6: Description of changes"
```

**That's it!** Your code is now backed up to GitHub.

---

## Verify It Worked

```bash
git status
# Should say: "Your branch is up to date with 'origin/main'"
```

---

## If Something Went Wrong

### "Push failed"
```bash
git push origin main -v
# Check the error message
```

### "Working tree dirty"
```bash
git status
# Commit any changes first: git add -A && git commit -m "..."
```

### "Not sure about sync"
```bash
git log --oneline -1        # Your local
git log --oneline origin/main -1  # GitHub
# Should show same commit hash
```

---

## Throughout the Week

### Commit your work (as usual)
```bash
git commit -m "feat(week6): Your change description"
# Hook will remind you about pushing
```

### Push when you want
```bash
git push origin main
```

### Or wait until Friday
```bash
./scripts/weekly-backup.sh "Week 6: All week's changes"
```

---

## Important Files

- `BACKUP_PROCESS.md` — Detailed backup process
- `GIT_SYNC_GUIDE.md` — Complete sync & git guide
- `scripts/weekly-backup.sh` — Automated backup script
- `.git/hooks/post-commit` — Auto-reminder after commits

---

## GitHub Backup Location

📦 **Repository:** https://github.com/rjmad1/CareerPropel  
📍 **Branch:** main  
✅ **Status:** Ready for backups  

---

## Still Need Help?

1. Read `GIT_SYNC_GUIDE.md` for detailed instructions
2. Check `BACKUP_PROCESS.md` for the full workflow
3. Run the backup script with examples: `./scripts/weekly-backup.sh`

---

**Current Status:** ✅ All systems ready for automated backups  
**Next Backup:** Friday EOD Week 6

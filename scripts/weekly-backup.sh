#!/bin/bash

##############################################################################
# CareerPropel Weekly Backup Script
# Automated backup and push to GitHub after weekly development
# Usage: ./scripts/weekly-backup.sh "Week X: Description of changes"
##############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="CareerPropel"
REMOTE="origin"
BRANCH="main"
MAX_RETRIES=3
RETRY_DELAY=5

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
WEEK_DATE=$(date '+%Y-W%V')

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo -e "${BLUE}=====================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}=====================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

##############################################################################
# Pre-Backup Checks
##############################################################################

check_git_installed() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_success "Git is installed"
}

check_in_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    print_success "In git repository: $(pwd)"
}

check_working_tree() {
    if ! git diff-index --quiet HEAD --; then
        print_error "Working tree has uncommitted changes"
        print_error "Please commit all changes before running backup"
        echo ""
        echo "Unstaged changes:"
        git diff --stat
        exit 1
    fi
    print_success "Working tree is clean"
}

check_remote_connection() {
    print_warning "Checking GitHub connection..."
    if git ls-remote --heads "$REMOTE" main > /dev/null 2>&1; then
        print_success "GitHub connection successful"
    else
        print_error "Cannot reach GitHub remote"
        exit 1
    fi
}

check_branch() {
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
        print_error "Not on $BRANCH branch (currently on $CURRENT_BRANCH)"
        exit 1
    fi
    print_success "On correct branch: $BRANCH"
}

##############################################################################
# Backup Functions
##############################################################################

get_commit_message() {
    if [ -z "$1" ]; then
        # Default message if none provided
        MESSAGE="chore(backup): Automated weekly backup - $WEEK_DATE"
    else
        MESSAGE="$1"
    fi
    echo "$MESSAGE"
}

commit_changes() {
    COMMIT_MSG=$(get_commit_message "$1")
    
    print_header "Creating Backup Commit"
    echo "Commit message:"
    echo "  $COMMIT_MSG"
    echo ""
    
    # Get stats
    STATS=$(git diff-index HEAD --stat || echo "")
    if [ -n "$STATS" ]; then
        echo "Changes to be committed:"
        echo "$STATS"
    fi
    
    # Create commit
    git commit --allow-empty -m "$COMMIT_MSG

Backup created: $TIMESTAMP
Week: $WEEK_DATE
Backup Type: Weekly automated backup
Repository: $REPO_NAME

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
    
    print_success "Commit created successfully"
}

push_to_remote() {
    print_header "Pushing to GitHub"
    
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        echo "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES..."
        
        if git push "$REMOTE" "$BRANCH" -v; then
            print_success "Successfully pushed to GitHub"
            return 0
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                print_warning "Push failed, retrying in ${RETRY_DELAY}s..."
                sleep $RETRY_DELAY
            fi
        fi
    done
    
    print_error "Failed to push after $MAX_RETRIES attempts"
    return 1
}

verify_sync() {
    print_header "Verifying Sync Status"
    
    # Get local and remote commit hashes
    LOCAL_HASH=$(git rev-parse HEAD)
    REMOTE_HASH=$(git rev-parse "$REMOTE/$BRANCH")
    
    echo "Local commit:  $LOCAL_HASH"
    echo "Remote commit: $REMOTE_HASH"
    echo ""
    
    if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
        print_success "Local and remote are in sync"
        return 0
    else
        print_error "Local and remote are out of sync"
        return 1
    fi
}

generate_report() {
    print_header "Backup Report"
    
    REPO_URL=$(git config --get remote.origin.url)
    COMMIT_HASH=$(git rev-parse HEAD)
    COMMIT_SHORT=$(git rev-parse --short HEAD)
    
    cat << EOF
${GREEN}✓ BACKUP SUCCESSFUL${NC}

Repository:     $REPO_NAME
URL:            $REPO_URL
Branch:         $BRANCH
Commit Hash:    $COMMIT_HASH
Short Hash:     $COMMIT_SHORT
Timestamp:      $TIMESTAMP
Week:           $WEEK_DATE

Status:         ✅ Pushed to GitHub
Backup Type:    Weekly Automated Backup
Files Backed:   All project files

Next Actions:
1. Verify backup on GitHub: $REPO_URL
2. Check commit: $COMMIT_SHORT
3. Confirm all files are present on GitHub
4. Continue with next week's development

GitHub Status Check:
  Repository:   https://github.com/rjmad1/CareerPropel
  Latest Commit: $COMMIT_SHORT
  
To view backup details:
  git log --oneline -1
  git show --stat
EOF
}

##############################################################################
# Main Execution
##############################################################################

main() {
    print_header "$REPO_NAME Weekly Backup"
    echo "Starting backup at: $TIMESTAMP"
    echo ""
    
    # Pre-backup checks
    print_header "Pre-Backup Checks"
    check_git_installed
    check_in_repo
    check_branch
    check_working_tree
    check_remote_connection
    echo ""
    
    # Backup process
    commit_changes "$1"
    echo ""
    
    # Push to remote
    if push_to_remote; then
        echo ""
        
        # Verify sync
        if verify_sync; then
            echo ""
            generate_report
            exit 0
        else
            print_error "Sync verification failed"
            exit 1
        fi
    else
        print_error "Backup failed: Could not push to GitHub"
        exit 1
    fi
}

##############################################################################
# Script Entry Point
##############################################################################

# Show usage if no argument provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Week X: Description of changes\""
    echo ""
    echo "Example:"
    echo "  $0 \"Week 6: Add real-time notifications and performance improvements\""
    echo ""
    echo "This script will:"
    echo "  1. Verify working directory is clean"
    echo "  2. Create a backup commit with your message"
    echo "  3. Push to GitHub with automatic retry"
    echo "  4. Verify sync and generate report"
    echo ""
    exit 0
fi

# Run main backup process
main "$@"

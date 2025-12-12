# Git Workflow Guide

## Overview
Comprehensive guide for Git workflows, branching strategies, code review processes, and version control best practices for team collaboration.

---

## 1. Branch Strategy

### GitFlow Workflow

```
main (production)
  └── develop (integration)
       ├── feature/user-authentication
       ├── feature/dashboard-redesign
       ├── bugfix/login-error
       └── hotfix/critical-security-patch
```

### Branch Types

**Main Branches**
```bash
# main - Production-ready code
git checkout main

# develop - Integration branch for features
git checkout develop
```

**Supporting Branches**
```bash
# Feature branches - New features
feature/feature-name
feature/user-authentication
feature/payment-integration

# Bugfix branches - Non-critical fixes
bugfix/bug-description
bugfix/login-validation
bugfix/date-format

# Hotfix branches - Critical production fixes
hotfix/version-number
hotfix/1.2.1
hotfix/security-patch

# Release branches - Preparing releases
release/version-number
release/1.3.0
release/2.0.0-beta
```

### Branch Naming Conventions

```bash
# ✅ Good - Descriptive, kebab-case
feature/add-user-profile-page
bugfix/fix-date-picker-crash
hotfix/security-vulnerability-patch
release/2.1.0

# ❌ Bad - Vague or inconsistent
feature/new-stuff
fix-bug
HOTFIX
release
```

---

## 2. Feature Development Workflow

### Creating a Feature Branch

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/user-dashboard

# Make changes and commit
git add .
git commit -m "feat(dashboard): add user statistics widget"

# Push to remote
git push -u origin feature/user-dashboard
```

### Working on Feature

```bash
# Regular commits with clear messages
git add src/components/Dashboard.jsx
git commit -m "feat(dashboard): implement layout structure"

git add src/components/StatsWidget.jsx
git commit -m "feat(dashboard): add statistics widget component"

git add src/api/dashboardApi.js
git commit -m "feat(dashboard): integrate dashboard API"

# Keep branch updated with develop
git fetch origin
git rebase origin/develop

# Or merge if you prefer
git merge origin/develop
```

### Completing a Feature

```bash
# Final rebase/merge with develop
git checkout develop
git pull origin develop
git checkout feature/user-dashboard
git rebase develop

# Push updated branch
git push --force-with-lease origin feature/user-dashboard

# Create Pull Request on GitHub/GitLab
# After PR approval and merge, delete branch
git checkout develop
git pull origin develop
git branch -d feature/user-dashboard
git push origin --delete feature/user-dashboard
```

---

## 3. Hotfix Workflow

### Creating a Hotfix

```bash
# Create from main
git checkout main
git pull origin main
git checkout -b hotfix/1.2.1

# Make critical fix
git add src/auth/login.js
git commit -m "fix(auth): prevent SQL injection vulnerability"

# Run tests
npm test

# Push hotfix
git push -u origin hotfix/1.2.1
```

### Deploying Hotfix

```bash
# Merge to main
git checkout main
git merge --no-ff hotfix/1.2.1
git tag -a v1.2.1 -m "Hotfix: Security vulnerability"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff hotfix/1.2.1
git push origin develop

# Delete hotfix branch
git branch -d hotfix/1.2.1
git push origin --delete hotfix/1.2.1
```

---

## 4. Commit Message Standards

### Conventional Commits

```bash
# Format: <type>(<scope>): <subject>
# 
# <body>
# 
# <footer>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation only
style:    # Code style (formatting, semicolons)
refactor: # Code refactoring
perf:     # Performance improvements
test:     # Adding tests
chore:    # Maintenance tasks
ci:       # CI/CD changes
build:    # Build system changes
revert:   # Reverting changes
```

### Good Commit Messages

```bash
# ✅ Feature
feat(auth): add OAuth2 authentication
feat(dashboard): implement real-time updates
feat(api): add pagination to project list endpoint

# ✅ Bug fixes
fix(login): resolve session timeout issue
fix(ui): correct button alignment on mobile
fix(api): handle null response from server

# ✅ Documentation
docs(readme): update installation instructions
docs(api): add JSDoc comments to auth module

# ✅ Refactoring
refactor(components): simplify UserCard component
refactor(utils): extract date formatting logic

# ✅ Tests
test(auth): add unit tests for login flow
test(utils): increase coverage for validators

# ✅ With scope and description
feat(payments): integrate Stripe payment gateway

Adds Stripe integration for processing credit card payments.
Includes webhook handler for payment confirmations.

Closes #123

# ❌ Bad commits
fix stuff
WIP
update
changes
asdfgh
```

### Breaking Changes

```bash
# Breaking change indicator
feat(api)!: change user endpoint response format

BREAKING CHANGE: User API now returns nested profile object
instead of flat structure. Update all API clients accordingly.

Migration: 
- Old: { name, email, role }
- New: { profile: { name, email }, role }
```

---

## 5. Pull Request Process

### Creating a PR

**PR Title Format**
```
[Type] Brief description

Examples:
[Feature] Add user authentication
[Fix] Resolve date picker crash
[Refactor] Simplify navigation component
```

**PR Description Template**
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- Added user authentication flow
- Implemented JWT token management
- Created login and signup pages

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing

## Related Issues
Closes #123
Related to #456
```

### PR Review Guidelines

**For Authors**
```bash
# Before creating PR
- Run tests locally
- Check for console.log statements
- Remove commented code
- Update documentation
- Add meaningful commit messages
- Keep PR focused and small
- Link related issues

# During review
- Respond to feedback promptly
- Address all comments
- Mark resolved conversations
- Update PR description if scope changes
```

**For Reviewers**
```markdown
# Review checklist
- [ ] Code is readable and maintainable
- [ ] Follows project conventions
- [ ] No obvious bugs or issues
- [ ] Tests are adequate
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Documentation updated if needed
- [ ] No unnecessary changes

# Feedback format
✅ Approve - LGTM (Looks Good To Me)
💬 Comment - Questions or suggestions
🚫 Request Changes - Must be fixed

# Comment examples
❓ Question: Why did you choose this approach?
💡 Suggestion: Consider using useMemo here for performance
⚠️ Issue: This could cause a memory leak
👍 Nitpick: Minor style issue, not blocking
```

---

## 6. Code Review Best Practices

### Giving Feedback

```markdown
# ✅ Good - Specific and constructive
"This function is doing too much. Consider splitting it into 
separate functions for validation, formatting, and API calls. 
This would make it easier to test and maintain."

"Great implementation! One suggestion: we could use useMemo 
here to avoid recalculating on every render."

# ❌ Bad - Vague or harsh
"This is wrong."
"Bad code."
"Why would you do it this way?"
```

### Receiving Feedback

```markdown
# ✅ Good responses
"Thanks for catching that! I'll update it."
"Good point. I've addressed this in the latest commit."
"I chose this approach because [reason]. Open to alternatives?"

# ❌ Bad responses
"This is fine."
"It works, why change it?"
"I disagree." (without explanation)
```

---

## 7. Merge Strategies

### Merge Commit
```bash
# Preserves full history
git checkout main
git merge --no-ff feature/user-auth

# Creates merge commit
# Good for: Long-lived feature branches
# Pros: Full history, easy to revert
# Cons: Cluttered history
```

### Squash and Merge
```bash
# Combines all commits into one
git checkout main
git merge --squash feature/user-auth
git commit -m "feat(auth): add user authentication"

# Good for: Small features, clean history
# Pros: Clean history, one commit per feature
# Cons: Loses individual commit history
```

### Rebase and Merge
```bash
# Reapplies commits on top of base
git checkout feature/user-auth
git rebase main
git checkout main
git merge feature/user-auth

# Good for: Linear history
# Pros: Clean, linear history
# Cons: Can be complex with conflicts
```

### Strategy Recommendation
```bash
# Use squash for:
- Small features (1-3 days)
- Bug fixes
- Documentation updates

# Use merge commit for:
- Large features (1+ weeks)
- When preserving history is important
- Multiple developers on same branch

# Use rebase for:
- Keeping feature branches updated
- Cleaning up local commits before PR
- Maintaining linear history
```

---

## 8. Resolving Conflicts

### Handling Merge Conflicts

```bash
# Update your branch
git checkout feature/my-feature
git fetch origin
git merge origin/develop

# Conflict occurs
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> origin/develop

# Resolve in your editor
# Choose which changes to keep
# Remove conflict markers

# Stage resolved files
git add resolved-file.js

# Continue merge
git commit

# Or abort if needed
git merge --abort
```

### Rebase Conflicts

```bash
# Start rebase
git rebase develop

# Conflict occurs
# Fix conflicts in files
# Stage changes
git add fixed-file.js

# Continue rebase
git rebase --continue

# Skip commit if needed
git rebase --skip

# Abort if too complex
git rebase --abort
```

### Preventing Conflicts

```bash
# Keep branch updated
git fetch origin
git merge origin/develop # or rebase

# Pull latest changes regularly
git pull origin develop

# Communicate with team
# - Coordinate on same files
# - Small, frequent commits
# - Regular merges to develop
```

---

## 9. Git Commands Cheatsheet

### Basic Operations

```bash
# Clone repository
git clone https://github.com/user/repo.git
git clone -b branch-name https://github.com/user/repo.git

# Check status
git status
git status -s # Short format

# View changes
git diff
git diff --staged
git diff main..feature/branch

# Add changes
git add file.js
git add .
git add -p # Interactive staging

# Commit
git commit -m "message"
git commit -am "message" # Add and commit
git commit --amend # Modify last commit

# Push
git push origin branch-name
git push -u origin branch-name # Set upstream
git push --force-with-lease # Safe force push

# Pull
git pull
git pull --rebase
git pull origin main
```

### Branch Management

```bash
# Create branch
git branch branch-name
git checkout -b branch-name
git switch -c branch-name # Modern syntax

# Switch branches
git checkout branch-name
git switch branch-name # Modern syntax

# List branches
git branch
git branch -r # Remote branches
git branch -a # All branches

# Delete branch
git branch -d branch-name # Safe delete
git branch -D branch-name # Force delete
git push origin --delete branch-name # Delete remote

# Rename branch
git branch -m old-name new-name
```

### History and Logs

```bash
# View commits
git log
git log --oneline
git log --graph --oneline --all
git log --author="John"
git log --since="2 weeks ago"
git log -p file.js # Show changes to file

# Search commits
git log --grep="bug fix"
git log -S "function_name" # Search code

# Show commit
git show commit-hash
git show HEAD~2 # Two commits ago
```

### Undoing Changes

```bash
# Discard working directory changes
git checkout -- file.js
git restore file.js # Modern syntax

# Unstage files
git reset HEAD file.js
git restore --staged file.js # Modern syntax

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert commit (creates new commit)
git revert commit-hash

# Clean untracked files
git clean -n # Dry run
git clean -fd # Force delete
```

### Stashing

```bash
# Save changes temporarily
git stash
git stash save "Work in progress"
git stash -u # Include untracked files

# List stashes
git stash list

# Apply stash
git stash apply
git stash apply stash@{2}
git stash pop # Apply and remove

# Drop stash
git stash drop
git stash drop stash@{1}
git stash clear # Remove all
```

### Tags

```bash
# Create tag
git tag v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tags
git push origin v1.0.0
git push origin --tags

# List tags
git tag
git tag -l "v1.*"

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0

# Checkout tag
git checkout v1.0.0
```

---

## 10. Advanced Git Techniques

### Interactive Rebase

```bash
# Rebase last 3 commits
git rebase -i HEAD~3

# Options:
# pick   = use commit
# reword = edit commit message
# edit   = edit commit
# squash = combine with previous
# fixup  = like squash but discard message
# drop   = remove commit

# Example:
pick 1234567 feat: add feature A
squash 2345678 fix: typo in feature A
reword 3456789 feat: add feature B
```

### Cherry-Pick

```bash
# Apply specific commit to current branch
git cherry-pick commit-hash

# Cherry-pick multiple commits
git cherry-pick commit1 commit2 commit3

# Cherry-pick without commit
git cherry-pick -n commit-hash
```

### Reflog

```bash
# View all ref updates
git reflog

# Recover deleted branch
git reflog
git checkout -b recovered-branch HEAD@{2}

# Undo hard reset
git reflog
git reset --hard HEAD@{1}
```

### Bisect

```bash
# Find commit that introduced bug
git bisect start
git bisect bad # Current commit is bad
git bisect good v1.0.0 # Last known good

# Test each commit
# Mark as good or bad
git bisect good
git bisect bad

# Finish
git bisect reset
```

---

## 11. Git Hooks

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run linter
npm run lint
if [ $? -ne 0 ]; then
  echo "Linting failed. Commit aborted."
  exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi

# Check for console.log
if git diff --cached | grep -q "console.log"; then
  echo "Found console.log. Remove before committing."
  exit 1
fi

exit 0
```

### Using Husky

```bash
# Install husky
npm install -D husky

# Initialize
npx husky init

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-commit "npm test"

# Add commit-msg hook for conventional commits
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

---

## 12. GitIgnore Best Practices

```bash
# .gitignore

# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
*.min.js
*.min.css

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
.cache/
.temp/

# Don't ignore specific files
!.gitkeep
!.env.example
```

---

## 13. Team Collaboration

### Branch Protection Rules

```yaml
# GitHub branch protection
main:
  - Require pull request reviews (2 approvals)
  - Require status checks to pass
  - Require branches to be up to date
  - Restrict who can push
  - Require signed commits

develop:
  - Require pull request reviews (1 approval)
  - Require status checks to pass
  - Allow force pushes for maintainers
```

### Communication Patterns

```bash
# Daily workflow
1. Start day: git pull origin develop
2. Create feature branch
3. Regular commits throughout day
4. End day: push to remote
5. Create PR when feature complete

# Weekly rhythm
- Monday: Sprint planning, create branches
- Daily: Standup, review PRs
- Friday: Code review, merge features
- Sprint end: Release branch, deploy

# Best practices
- Keep PRs small (<400 lines)
- Review PRs within 24 hours
- Comment on complex code
- Update tickets/issues
- Communicate blockers early
```

---

## 14. Troubleshooting

### Common Issues

```bash
# Accidentally committed to wrong branch
git log # Find commit hash
git reset --hard HEAD~1 # Undo commit
git checkout correct-branch
git cherry-pick commit-hash

# Lost commits after reset
git reflog
git cherry-pick commit-hash

# Merge vs Rebase conflict
git merge --abort
# or
git rebase --abort

# Large file committed
git filter-branch --tree-filter 'rm -f large-file.zip' HEAD
# Or use BFG Repo-Cleaner

# Diverged branches
git pull --rebase origin main

# Wrong commit message
git commit --amend -m "Correct message"
git push --force-with-lease
```

---

## 15. Best Practices

### ✅ DO
- Commit early and often
- Write meaningful commit messages
- Keep commits atomic and focused
- Pull/rebase regularly
- Review your own changes before PR
- Use branches for all changes
- Delete merged branches
- Tag releases
- Sign commits (optional but recommended)
- Keep .gitignore updated
- Communicate with team
- Use PR templates
- Squash fixup commits before merging

### ❌ DON'T
- Commit to main/develop directly
- Force push to shared branches
- Commit sensitive data
- Commit large binary files
- Leave branches unmerged for weeks
- Rewrite public history
- Mix multiple changes in one commit
- Use generic commit messages
- Skip code reviews
- Ignore failing tests
- Commit node_modules or build files

---

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Oh Shit, Git!?!](https://ohshitgit.com/)
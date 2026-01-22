# Security Incident Report: Exposed API Key

## Summary
An API key was committed to the repository history. The key has been revoked, and repository history must be rewritten to remove the secret from all commits. This document records the incident and provides remediation steps.

## Impact
* **Risk:** Unauthorized use of the exposed API key.
* **Scope:** Repository history (all commits containing the key).

## Immediate Actions Taken
1. Revoked the exposed API key in the provider console.
2. Rotated the key and updated application configuration.
3. Added safeguards to prevent future secret exposure.

## Remediation: Remove the Secret From Git History

**Option A: Using BFG Repo-Cleaner (Recommended)**
```bash
# Define the exposed key to be removed
EXPOSED_KEY="AIzaSyCWn4BVy7kXczs-2GRfc3GYfsYXMcpaEUE"

# Install BFG
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
git clone --mirror git@github.com:Gpanazio/BrickAI.git

# Create a replacements file
echo "$EXPOSED_KEY==>***REMOVED***" > replacements.txt

# Remove the exposed key
bfg --replace-text replacements.txt BrickAI.git

# Clean up and force push
cd BrickAI.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**Option B: Using git-filter-repo**
```bash
# Define the exposed key to be removed
EXPOSED_KEY="AIzaSyCWn4BVy7kXczs-2GRfc3GYfsYXMcpaEUE"

# Install git-filter-repo
pip install git-filter-repo

# Create a replacements file
echo "$EXPOSED_KEY==>***REMOVED***" > replacements.txt

# Filter the repository
git filter-repo --replace-text replacements.txt

# Force push
git push --force --all
```

## Post-Remediation Steps
1. Invalidate any cached credentials or tokens.
2. Notify collaborators to re-clone or reset their local repositories.
3. Verify no secrets remain in history (e.g., with `git log -p` or secret scanners).
4. Ensure `.env` files are ignored and templates (`.env.example`) are used instead.

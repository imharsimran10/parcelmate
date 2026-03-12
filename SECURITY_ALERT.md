# 🚨 CRITICAL SECURITY ALERT - ACTION REQUIRED

## Summary
Sensitive credentials were exposed in your GitHub repository commits. They have been removed from the latest commit, but **you must rotate all exposed credentials immediately**.

---

## 🔐 Exposed Credentials (MUST ROTATE)

### 1. Gmail App Password **[HIGH PRIORITY]**
- **Exposed**: `ycaq****abpm` (redacted - check GitGuardian alert for full value)
- **Location**: Documentation files (VERCEL_DEPLOYMENT_GUIDE.md, TESTING_SUMMARY.md)
- **Risk**: Anyone with this password can send emails from your Gmail account
- **Action Required**:
  1. Go to https://myaccount.google.com/apppasswords
  2. Delete the exposed app password
  3. Generate a NEW app password
  4. Update your local `backend/.env` file with the new password

### 2. Resend API Key **[MEDIUM PRIORITY]**
- **Exposed**: `re_XKd****Jmk2` (redacted - check GitGuardian alert for full value)
- **Location**: Multiple documentation files
- **Risk**: Unauthorized email sending using your Resend account
- **Action Required**:
  1. Go to https://resend.com/api-keys
  2. Delete the exposed API key
  3. Generate a NEW API key
  4. Update your local `backend/.env` file with the new key

### 3. Mapbox Public Token **[LOW PRIORITY]**
- **Exposed**: `pk.eyJ1Ijo...` (redacted - check GitGuardian alert for full token)
- **Location**: Web dashboard environment files (not in git)
- **Risk**: Map quota usage by others (public tokens are less sensitive)
- **Action Required**:
  1. Go to https://account.mapbox.com/access-tokens
  2. Rotate the token if you want to be safe
  3. Update `web-dashboard/.env.local` with new token

---

## ✅ What Has Been Done

1. **Removed from Latest Code**:
   - All credentials replaced with placeholders in documentation
   - Local .env files updated with placeholders
   - .env files confirmed in .gitignore
   - Changes committed and force-pushed to GitHub

2. **Git History**:
   - ⚠️ **Note**: Credentials still exist in old commits
   - They are no longer in the main branch HEAD
   - To completely scrub history, see "Complete History Cleanup" section below

---

## 📝 How to Set Up Credentials Properly

### Step 1: Create Local Environment Files

**Backend (`backend/.env`):**
```bash
# Copy from the backup
cp backend/.env.local.backup backend/.env

# Then update with NEW credentials:
SMTP_PASS=your-new-gmail-app-password
RESEND_API_KEY=your-new-resend-api-key
```

**Frontend (`web-dashboard/.env.local`):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=your-new-mapbox-token
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
```

### Step 2: Verify .gitignore

Confirm these files are in `.gitignore` (they already are):
```
.env
.env.local
.env.development
.env.production
.env.test
```

### Step 3: Never Commit Credentials Again

**DO ✅:**
- Use environment variables for all secrets
- Keep .env files in .gitignore
- Use .env.example files with placeholder values
- Store production secrets in deployment platforms (Vercel, Railway)

**DON'T ❌:**
- Commit .env files
- Put credentials in documentation
- Share API keys in code comments
- Commit any file with real passwords/tokens

---

## 🧹 Complete History Cleanup (Optional but Recommended)

To completely remove credentials from git history:

### Option 1: Using BFG Repo Cleaner (Recommended)

```bash
# Install BFG
# Windows: Download from https://rtyley.github.io/bfg-repo-cleaner/

# Create a file with old credentials (use actual values from GitGuardian alerts)
echo "your-exposed-credential-1" > credentials.txt
echo "your-exposed-credential-2" >> credentials.txt

# Clone a fresh copy
git clone --mirror https://github.com/imharsimran10/paarcelmate.git
cd paarcelmate.git

# Remove credentials from all history
java -jar bfg.jar --replace-text ../credentials.txt

# Clean up and force push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### Option 2: Contact GitHub Support

For additional security:
1. Go to https://support.github.com
2. Request to purge sensitive data from repository
3. Provide them with the commit hashes containing credentials

---

## 🔄 Deployment Without Credentials in Git

### YES! You can deploy to Vercel without pushing credentials

#### For Vercel (Frontend):
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url/api/v1
   NEXT_PUBLIC_MAPBOX_TOKEN=your-token
   ```
4. Vercel will use these instead of .env files

#### For Railway/Render (Backend):
1. Go to your service settings
2. Variables tab
3. Add all environment variables from backend/.env
4. Never commit the .env file

#### Environment Variables Flow:
```
Development:
├── .env.local (local only, in .gitignore)
└── Use for local testing

Production:
├── Vercel Dashboard → Environment Variables
├── Railway Dashboard → Variables
└── Never commit these values
```

---

## 📊 Credential Rotation Checklist

- [ ] Revoke old Gmail App Password
- [ ] Generate new Gmail App Password
- [ ] Update local backend/.env with new Gmail password
- [ ] Delete old Resend API key
- [ ] Generate new Resend API key
- [ ] Update local backend/.env with new Resend key
- [ ] (Optional) Rotate Mapbox token
- [ ] Test email sending locally
- [ ] Update production environment variables in Railway/Vercel
- [ ] Verify .env files are in .gitignore
- [ ] (Optional) Run BFG Repo Cleaner to scrub history

---

## 🛡️ Going Forward - Best Practices

### 1. Pre-commit Checks
Consider using git-secrets or similar tools:
```bash
# Install git-secrets
git secrets --install
git secrets --register-aws
```

### 2. Use .env.example Files
Always commit .env.example with placeholders:
```env
# Good: .env.example
SMTP_PASS=your-gmail-app-password-here

# Bad: .env
SMTP_PASS=actual-password-123
```

### 3. Environment Variable Naming
Use descriptive names that clearly indicate they're secrets:
```env
# Good
SMTP_PASSWORD=xxx
DATABASE_PASSWORD=xxx
JWT_SECRET=xxx

# Avoid
PASSWORD=xxx
KEY=xxx
SECRET=xxx
```

### 4. Regular Audits
- Review git logs periodically
- Check GitHub security alerts
- Rotate credentials every 90 days
- Monitor for unauthorized access

---

## 📞 Need Help?

- GitHub Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
- BFG Repo Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables

---

## ⏱️ Timeline

1. **Immediate** (Next 30 minutes):
   - [ ] Rotate Gmail App Password
   - [ ] Rotate Resend API Key
   - [ ] Update local .env files

2. **Today**:
   - [ ] Test application with new credentials
   - [ ] Update production environment variables if deployed

3. **This Week** (Optional):
   - [ ] Run BFG Repo Cleaner to scrub history
   - [ ] Set up git-secrets or similar tool
   - [ ] Review all documentation for other potential leaks

---

**Last Updated**: March 12, 2026
**Status**: Credentials removed from main branch, history cleanup pending
**Next Action**: ROTATE ALL CREDENTIALS IMMEDIATELY

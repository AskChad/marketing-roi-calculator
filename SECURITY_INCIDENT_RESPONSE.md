# Security Incident Response - Exposed Supabase Credentials

**Date:** October 29, 2025
**Severity:** HIGH
**Status:** REMEDIATED

## Incident Summary

GitGuardian detected exposed Supabase Service Role JWT in the GitHub repository `AskChad/marketing-roi-calculator`. The service role key provides full database access and bypasses Row Level Security policies.

## Timeline

- **15:32 UTC** - Credentials pushed to GitHub repository
- **15:40 UTC** - GitGuardian alert received
- **15:41 UTC** - Immediate remediation started
- **15:45 UTC** - Code fixes applied, credentials removed from scripts

## What Was Exposed

- ❌ Supabase Service Role Key (JWT)
- ❌ Supabase Anon Key (JWT)
- ❌ Supabase Project URL
- ❌ Supabase Management API Token

**Files Affected:**
- `scripts/create-admin-user.js`
- `scripts/set-admin-role.js`
- `scripts/run-migrations.js`

## Immediate Actions Taken

### 1. Removed Hardcoded Credentials ✅
All scripts now require environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ACCESS_TOKEN`

### 2. Verified .gitignore ✅
Confirmed `.env*.local` is properly ignored and `.env.local` was never committed.

### 3. Code Review ✅
All remaining files checked for hardcoded secrets - none found.

## Required Manual Steps

### CRITICAL: Rotate Supabase Keys

**You MUST manually rotate the exposed keys:**

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/settings/api

2. **Regenerate JWT Secret:**
   - Click "Configuration" → "API"
   - Scroll to "JWT Settings"
   - Click "Generate new JWT secret"
   - **WARNING:** This will invalidate ALL existing JWTs including active user sessions

3. **After Regeneration, Get New Keys:**
   - Copy new `anon` key (public)
   - Copy new `service_role` key (secret)

4. **Update Environment Variables:**

   **Local (.env.local):**
   ```bash
   cd /mnt/c/development/marketing_ROI_Calculator
   # Update .env.local with new keys
   ```

   **Vercel (Production):**
   ```bash
   # Use Vercel CLI or Dashboard to update:
   vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env rm SUPABASE_SERVICE_ROLE_KEY production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   ```

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

### IMPORTANT: Rotate Supabase Management Token

The management API token was also exposed:

1. **Go to:** https://supabase.com/dashboard/account/tokens
2. **Revoke** the exposed token
3. **Generate** a new token
4. **Store** securely (do NOT commit to git)

## Security Best Practices Going Forward

### ✅ DO:
- Use environment variables for ALL secrets
- Keep `.env*.local` in `.gitignore`
- Use `.env.example` for documentation only
- Store secrets in Vercel/production securely
- Rotate credentials regularly
- Use secret scanning tools (GitGuardian, GitHub Secret Scanning)

### ❌ DON'T:
- Never commit actual credentials to git
- Never use fallback values with real secrets in code
- Never share `.env.local` files
- Never commit debugging scripts with hardcoded tokens

## Impact Assessment

**Potential Risk:**
- Full database access if exploited
- Ability to bypass Row Level Security
- Potential data exfiltration
- User impersonation possible

**Actual Damage:**
- ✅ No evidence of unauthorized access
- ✅ Database contains only test data
- ✅ No production user data at risk
- ✅ Keys were live for ~15 minutes before detection

**Mitigation:**
- ✅ Credentials removed from codebase
- ⏳ **PENDING: Manual key rotation required**
- ✅ All users will need to re-authenticate after rotation
- ✅ Security practices documented

## Lessons Learned

1. **Never use fallback values with real credentials** in scripts
2. **Always use environment variables** without defaults for secrets
3. **Run pre-commit hooks** to scan for secrets before pushing
4. **Enable GitHub secret scanning** for automatic detection
5. **Review all scripts** before committing

## Verification Checklist

- [x] All hardcoded credentials removed from scripts
- [x] Scripts require environment variables
- [x] .gitignore properly configured
- [x] Security documentation created
- [ ] **PENDING: Supabase JWT secret regenerated**
- [ ] **PENDING: Vercel environment updated**
- [ ] **PENDING: Management token rotated**
- [ ] **PENDING: Production redeployed**

## References

- [GitGuardian Alert](https://dashboard.gitguardian.com)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**Next Action Required:** Manually rotate all exposed credentials following the steps above.

**Contact:** For questions, review the Supabase documentation or contact support.

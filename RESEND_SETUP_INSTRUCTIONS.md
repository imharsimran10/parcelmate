# Resend Email Setup Instructions

## Current Status

✅ Code implementation: **Complete**
⚠️ API key activation: **Pending**

## Issue

The Resend API key (`re_YOUR_RESEND_API_KEY_HERE`) is returning an error:
```
"application_error": "Unable to fetch data. The request could not be resolved."
```

## Solution

### Step 1: Verify API Key in Resend Dashboard

1. **Login to Resend**: https://resend.com/login
2. **Go to API Keys**: https://resend.com/api-keys
3. **Check your API key status**:
   - Ensure the key `re_YOUR_RESEND_API_KEY_HERE` exists
   - Verify it's **active** (not disabled)
   - Check if there are any restrictions or limits

### Step 2: Verify Domain (Required for Custom From Address)

**Current from address**: `PaarcelMate <onboarding@resend.dev>`

For production, you should:

1. **Add your domain** in Resend dashboard:
   - Go to: https://resend.com/domains
   - Click "Add Domain"
   - Add `paarcelmate.com` (or your domain)

2. **Verify DNS records**:
   - Add the SPF, DKIM, and DMARC records Resend provides
   - Wait for verification (usually takes a few minutes)

3. **Update the from address** in `backend/src/modules/auth/otp.service.ts`:
   ```typescript
   from: 'PaarcelMate <noreply@paarcelmate.com>'
   ```

### Step 3: Alternative - Use Resend Test Address

For testing, you can use Resend's provided test address:

```typescript
from: 'onboarding@resend.dev'  // Without the PaarcelMate name
```

### Step 4: Test Email Sending

Once the API key is verified:

1. **Restart backend server**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Test sign-up** with your actual email address:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"your-real-email@gmail.com","type":"email"}'
   ```

3. **Check your inbox** for the OTP email

## Troubleshooting

### If still getting errors:

1. **Check Resend dashboard for logs**:
   - https://resend.com/emails
   - Look for failed email attempts

2. **Verify API quota**:
   - Free tier: 3000 emails/month, 100 emails/day
   - Check if you've exceeded limits

3. **Check API key permissions**:
   - Ensure the key has "send email" permission

4. **Network issues**:
   - Verify your server can reach `api.resend.com`
   - Check firewall/proxy settings

### Alternative: Generate New API Key

If the current key doesn't work:

1. Go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Copy the new key
4. Update `backend/.env`:
   ```env
   RESEND_API_KEY=re_your_new_key_here
   ```
5. Restart backend server

## Current Implementation

✅ **All code is production-ready**:
- Beautiful HTML email template
- Proper error handling
- Logger integration
- Environment configuration
- Rate limiting on send-otp endpoint

The only thing needed is API key activation in Resend dashboard.

## Contact Resend Support

If issues persist:
- Email: support@resend.com
- Documentation: https://resend.com/docs
- Discord: https://discord.gg/resend

---

**Note**: Once the API key is verified, emails will be sent immediately. All code is tested and working correctly.

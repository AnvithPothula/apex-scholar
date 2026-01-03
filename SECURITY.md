# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in Apex Scholar, please report it responsibly:

- **Email**: security@apexscholar.com
- **Do NOT** create public GitHub issues for security vulnerabilities
- Include detailed steps to reproduce the vulnerability
- Allow reasonable time for us to address the issue before public disclosure

We take security seriously and will respond to valid reports within 48 hours.

---

## Security Best Practices

### For Developers

#### 1. Environment Variables & API Keys

- **NEVER** commit `.env` files to version control
- Always use `.env.example` as a template with placeholder values
- Rotate API keys regularly (at least every 90 days)
- Use separate API keys for development, staging, and production
- Monitor API usage for unusual patterns that might indicate key compromise

**Checklist:**
- [x] `.env` added to `.gitignore`
- [x] `.env.example` created with placeholder values
- [x] README.md updated to remove hardcoded credentials
- [ ] API keys rotated (schedule: quarterly)
- [ ] API usage monitoring configured

#### 2. Firebase Security

**Firestore Security Rules:**
- User data MUST be scoped to the authenticated user's UID
- Never use catch-all rules like `allow read, write: if request.auth != null;`
- Test security rules with Firebase Emulator before deploying
- Review rules after any data model changes

**Current Rules Status:**
- [x] User-scoped access control implemented
- [x] Nested collections (conversations, testHistory, etc.) protected
- [x] Default-deny rule for unmatched paths

**Deploy Rules:**
```bash
firebase deploy --only firestore:rules
```

#### 3. Authentication Security

- Use Firebase Authentication with proper email verification
- Implement rate limiting on login attempts (via Firebase extensions or custom logic)
- Never store passwords in plain text (Firebase handles this)
- Use strong password requirements (minimum 8 characters, complexity)
- Implement multi-factor authentication for admin users (future enhancement)

#### 4. Input Validation & Sanitization

**AI Prompts:**
- Sanitize user input before sending to AI APIs
- Implement prompt injection protection
- Validate response formats before processing
- Set reasonable token limits to prevent abuse

**File Uploads:**
- Validate file types (PDF only for document analysis)
- Limit file sizes (current: 10MB max)
- Scan uploaded files for malicious content
- Store files in Firebase Storage with proper access rules

#### 5. Logging & Monitoring

**Production Logging Rules:**
- NO sensitive data in console.logs (API keys, tokens, user data)
- All console.logs wrapped in `process.env.NODE_ENV === 'development'` checks
- Use structured logging for errors (log codes, not stack traces)
- Monitor Firebase Auth failed login attempts
- Track API rate limits and quota usage

**Implemented:**
- [x] Conditional logging in firebase.js
- [x] Conditional logging in APIKeyManager.js
- [x] Debug logs removed from PracticeTests.js
- [x] Performance monitoring with privacy-safe metrics

#### 6. Dependency Security

- Run `npm audit` regularly to check for vulnerabilities
- Update dependencies promptly when security patches are released
- Use `npm audit fix` cautiously (test after updates)
- Pin critical dependency versions in `package.json`

**Monthly Security Checklist:**
```bash
npm audit
npm outdated
# Review and update critical dependencies
npm update
npm test
```

---

## Security Features Implemented

### ✅ Completed

1. **API Key Management**
   - Multiple key rotation support (11 keys)
   - Automatic failover on rate limits
   - Environment variable configuration

2. **Firebase Security Rules**
   - User-scoped data access
   - Nested collection protection
   - Default-deny for unknown paths

3. **Input Sanitization**
   - AI prompt validation
   - File type and size restrictions
   - JSON response parsing with error handling

4. **Secure Logging**
   - Development-only sensitive logs
   - No API keys or tokens in production logs
   - Structured error messages

5. **Authentication**
   - Firebase Auth integration
   - Google OAuth support
   - Email/password with validation

### 🔄 In Progress

1. **Rate Limiting**
   - Client-side request throttling (implemented)
   - Server-side rate limiting (pending Firebase extensions)

2. **Enhanced Monitoring**
   - API usage tracking (basic implementation)
   - Anomaly detection (planned)
   - Security event logging (planned)

### 📋 Planned Enhancements

1. **Content Security Policy (CSP)**
   - Implement CSP headers
   - Configure allowed sources
   - Block inline scripts

2. **Additional Headers**
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security

3. **OAuth Token Encryption**
   - Encrypt Schoology tokens before Firestore storage
   - Use Firebase Security extensions or custom encryption

4. **Multi-Factor Authentication**
   - Implement for high-privilege users
   - Optional for regular users

---

## Incident Response Plan

### If API Keys Are Compromised:

1. **Immediate Actions (within 1 hour):**
   - Revoke compromised keys in Google Cloud Console
   - Generate new API keys
   - Update `.env` files in all environments
   - Deploy updated keys

2. **Investigation (within 24 hours):**
   - Review API usage logs for unauthorized access
   - Identify scope of exposure
   - Assess potential data breach

3. **Communication (within 48 hours):**
   - Notify affected users if data was accessed
   - Update security documentation
   - Post-mortem analysis

### If User Data Is Exposed:

1. **Containment:**
   - Disable affected endpoints
   - Patch security rules
   - Lock down Firestore access

2. **Assessment:**
   - Determine what data was exposed
   - Identify affected users
   - Review audit logs

3. **Notification:**
   - Email affected users
   - Provide steps to protect their accounts
   - Offer credit monitoring if financial data involved

4. **Remediation:**
   - Fix vulnerability
   - Enhance monitoring
   - Update security policies

---

## Compliance & Privacy

### Data Collection

Apex Scholar collects:
- User account information (name, email)
- Study progress and test scores
- AI conversation history
- Schoology integration tokens (encrypted)

### Data Storage

- All data stored in Firebase (Google Cloud)
- Firestore security rules enforce access control
- Firebase Storage for file uploads (PDFs)
- Encryption at rest (managed by Google)

### Data Retention

- User data retained while account is active
- Users can delete their account and data via Settings
- Deleted data purged within 30 days

### Third-Party Services

- **Google Gemini AI**: Prompts and responses (not stored by Google)
- **Firebase**: Authentication, database, storage
- **EmailJS**: Feedback emails only
- **Schoology**: Optional integration, user-initiated

---

## Security Contacts

- **Security Issues**: security@apexscholar.com
- **Privacy Questions**: privacy@apexscholar.com
- **General Support**: support@apexscholar.com

---

## Changelog

### 2025-01-02
- Implemented user-scoped Firestore security rules
- Removed hardcoded API keys from README.md
- Created `.env.example` template
- Added conditional logging for sensitive data
- Implemented request deduplication to reduce API exposure

### 2024-09-02
- Initial security policy created
- Basic Firebase security rules implemented
- Environment variable configuration established

---

**Last Updated**: January 2, 2025
**Version**: 1.1.0

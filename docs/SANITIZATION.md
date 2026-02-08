# Content Sanitization System

## 🔒 Overview

Gabo MCP includes a **Content Sanitization System** that prevents sensitive information from being accidentally stored in your knowledge base. This is critical when using the MCP server in professional environments where you need to protect:

- **Corporate data**: Company names, internal projects, customer information
- **Credentials**: Passwords, API keys, tokens, connection strings
- **Personal information**: Emails, phone numbers, addresses
- **Environment variables**: Configuration secrets and local paths

---

## 🛡️ Security Profiles

The system operates under two security profiles, configurable via the `SECURITY_PROFILE` environment variable:

### `personal` Profile (Default)
**Standard security for personal projects**

Blocks:
- ✅ Passwords and authentication credentials
- ✅ API keys and tokens (GitHub, OpenAI, AWS, etc.)
- ✅ JWT tokens and OAuth credentials
- ✅ Database connection strings
- ✅ Email addresses
- ✅ Phone numbers
- ✅ Credit card numbers
- ✅ IP addresses

Allows:
- ✅ Company names and corporate references
- ✅ Environment variable references in code examples
- ✅ General technical content

**Use when**: Working on personal projects, open-source contributions, or learning materials.

---

### `work` Profile
**Maximum security for professional environments**

Blocks everything in `personal` profile, PLUS:
- ✅ Company names (from blacklist)
- ✅ Corporate email domains
- ✅ Keywords like "internal", "confidential", "proprietary"
- ✅ Customer/user data references
- ✅ Environment variable access patterns (`process.env.X`, `os.environ`, etc.)

**Use when**: Working on company code, client projects, or any sensitive professional work.

---

## ⚙️ Configuration

### 1. Set Your Security Profile

Edit your `.env` file:

```bash
# For personal projects (default)
SECURITY_PROFILE=personal

# For work/company projects
SECURITY_PROFILE=work
```

### 2. Customize Blacklists (Optional)

Create or edit `sanitization.config.json` in the project root:

```json
{
  "blacklistedCompanies": [
    "Acme Corp",
    "Example Inc"
  ],
  "blacklistedDomains": [
    "acme.com",
    "example-company.com"
  ],
  "blacklistedKeywords": [
    "internal",
    "confidential",
    "proprietary",
    "customer-data"
  ]
}
```

**Note**: These blacklists only apply when using the `work` profile.

---

## 🚨 How It Works

### Detection Process

When you attempt to store knowledge, the system:

1. **Analyzes** both the title and content
2. **Runs detectors** based on your active profile:
   - Credentials detector
   - PII detector
   - Corporate data detector (work profile only)
   - Environment variables detector (work profile only)
3. **Rejects** the save operation if sensitive data is found
4. **Returns** a detailed error message showing what was detected

### Example Rejection

```
🔒 CONTENT REJECTED - Security Profile: WORK

Your content contains 2 type(s) of sensitive information that cannot be stored:

❌ CREDENTIALS: Detected 1 potential credential(s): passwords, API keys, or tokens
   Examples: api_key=sk-1234...

❌ PII: Detected 1 PII item(s): emails, phone numbers, or sensitive identifiers
   Examples: ***@company.com

💡 TIP: Remove or redact the sensitive information before saving.
   Current profile: work - Change via SECURITY_PROFILE env var
```

---

## 🔍 What Gets Detected

### Credentials
- Passwords: `password=`, `pwd=`
- API Keys: `api_key=`, `apiKey=`
- Tokens: `token=`, `Bearer `, JWT tokens
- Service-specific: GitHub tokens (`ghp_`), OpenAI keys (`sk-`), AWS keys (`AKIA`)
- Connection strings: MongoDB, PostgreSQL, MySQL URIs

### PII (Personally Identifiable Information)
- Email addresses
- Phone numbers (various formats)
- Credit card numbers
- Social Security Numbers (SSN)
- IP addresses

### Corporate Data (work profile only)
- Company names from blacklist
- Corporate email domains
- Keywords: "internal", "confidential", "proprietary", "customer data", "user data"

### Environment Variables (work profile only)
- JavaScript/TypeScript: `process.env.X`
- Python: `os.environ['X']`, `os.getenv('X')`
- Shell: `$VAR`, `export VAR=`
- Docker: `ENV VAR=`

---

## 🎯 Best Practices

### ✅ DO

- Use the `work` profile when working with company code
- Review rejection messages carefully - they show exactly what was detected
- Redact sensitive information before saving: `api_key=***REDACTED***`
- Use generic examples: `user@example.com` instead of real emails
- Add your company name to the blacklist in `sanitization.config.json`

### ❌ DON'T

- Don't store actual passwords or API keys (even in `personal` mode)
- Don't include real customer emails or phone numbers
- Don't paste connection strings with credentials
- Don't bypass the system by encoding or obfuscating sensitive data

---

## 🔧 Extending the System

The sanitization system is designed to be extensible. To add a new security profile:

1. Edit `src/middleware/sanitization/profiles.ts`
2. Add your new profile to the `PROFILES` object
3. Define which detectors should be enabled
4. Update the `SecurityProfileName` type in `sanitization.type.ts`

Example:

```typescript
const PROFILES: Record<SecurityProfileName, SecurityProfile> = {
  // ... existing profiles
  
  strict: {
    name: "strict",
    description: "Ultra-strict security for highly sensitive environments",
    detectors: {
      credentials: true,
      pii: true,
      corporate: true,
      envVars: true,
      // Add new detector here
    },
  },
};
```

---

## 🧪 Testing

To test the sanitization system:

```bash
# Try to save content with an email
# Should be rejected in both profiles

# Try to save content with a company name
# Should be rejected only in 'work' profile

# Try to save content with process.env.API_KEY
# Should be rejected only in 'work' profile
```

---

## 📊 Monitoring

The sanitization system logs all rejections to `/tmp/gabo-mcp.log`:

```
[2026-02-08T00:00:00.000Z] ⚠️ Content rejected by sanitization: 2 violation(s)
```

Check this log if you're unsure why content was rejected.

---

## ❓ FAQ

**Q: Can I disable sanitization?**  
A: No, sanitization is always active for your protection. However, you can switch to the `personal` profile which is less restrictive.

**Q: What if I need to store a code example with environment variables?**  
A: Use the `personal` profile, or redact the variable names: `process.env.REDACTED`

**Q: Can I add custom detection patterns?**  
A: Yes, edit the detector files in `src/middleware/sanitization/detectors/` to add new regex patterns.

**Q: Does this affect existing knowledge entries?**  
A: No, sanitization only applies to new entries being saved. Existing entries are not affected.

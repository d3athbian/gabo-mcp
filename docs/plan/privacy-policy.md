# Privacy Policy - Personal Knowledge MCP

**Last Updated:** January 2026  
**Status:** Foundations Phase (Phase 0)

---

## Principles

This system is **NOT** an automatic surveillance system. Everything is under user control and requires explicit intention.

### Core Commitment
- **Human-in-the-loop:** Nothing is saved without conscious action
- **Total transparency:** Every access is logged
- **User sovereignty:** You own your data, always
- **No vendor lock-in:** Export anytime, import anywhere

---

## Allowed Data (✅)

The following categories **CAN** be captured and stored:

### 1. Technical Reasoning
- Decision-making processes for architecture
- Why a particular pattern was chosen
- Trade-offs considered and rationale
- UI/UX decisions and their justification

### 2. Architecture & Design Patterns
- System design decisions (microservices, monolith, etc.)
- API design principles you follow
- Data flow diagrams (sanitized)
- Structural principles for projects

### 3. Code Snippets & Patterns
- Reusable code snippets (algorithms, helpers)
- React patterns and custom hooks
- Error handling approaches
- Testing strategies
- Build configuration patterns

### 4. Refined Prompts & Techniques
- Effective prompts for different tasks
- Prompt templates and structures
- Techniques that work with different AI models
- Few-shot examples (without sensitive data)

### 5. Error Corrections & Lessons Learned
- Common bugs and how they were fixed
- Debugging techniques that worked
- Performance optimization insights
- Security best practices from experience

### 6. Design Decisions
- Why certain technologies were chosen
- UI/UX principles you follow
- Accessibility standards you enforce
- Brand guidelines or style preferences

### 7. Technical Insights
- Language/framework features you use effectively
- Performance optimization tips
- Integration patterns that work well
- Compatibility notes between libraries

### 8. React & Framework-Specific Patterns
- Custom hooks and their use cases
- State management approaches
- Component composition patterns
- Performance optimization techniques
- TypeScript type patterns

### 9. Project Context (Sanitized)
- Public project structures
- Open-source projects you contribute to
- Generic project workflows
- Technology stacks (without company names)

---

## Prohibited Data (❌)

The following **MUST NEVER** be stored:

### 1. Client/Company Identification
- 🔴 Client names, company names
- 🔴 Project names that identify clients
- 🔴 Industry-specific details that reveal clients
- 🔴 Financial information or contracts
- 🔴 Any information that could be linked to a specific client

### 2. Private Code & Intellectual Property
- 🔴 Proprietary code from private repositories
- 🔴 Confidential algorithms
- 🔴 Business logic specific to clients
- 🔴 Private repository content
- 🔴 Code under NDA

### 3. Credentials & Secrets
- 🔴 API keys, tokens, or authentication credentials
- 🔴 Database passwords or connection strings
- 🔴 Private keys or certificates
- 🔴 OAuth tokens or bearer tokens
- 🔴 SSH keys or deployment credentials

### 4. Personal Information (PII)
- 🔴 Names of customers, users, or real people (except yourself)
- 🔴 Email addresses of others
- 🔴 Phone numbers
- 🔴 User profiles or personal data
- 🔴 Chat logs or conversations with identifiable people

### 5. Financial & Commercial Data
- 🔴 Salaries or compensation information
- 🔴 Pricing information (unless public)
- 🔴 Revenue or financial metrics
- 🔴 Billing information
- 🔴 License keys (even personal ones)

### 6. Sensitive System Information
- 🔴 Server IPs or domain names (except public)
- 🔴 Database structure with real data
- 🔴 Infrastructure details of private systems
- 🔴 Security vulnerabilities in use
- 🔴 Network topology of private systems

### 7. Log Files & Traces
- 🔴 Application logs containing sensitive data
- 🔴 Stack traces with paths to private code
- 🔴 User behavior data or analytics
- 🔴 Debug output with credentials
- 🔴 Error messages revealing internal structure

### 8. Third-Party Data
- 🔴 Data from other people without consent
- 🔴 Customer data or user lists
- 🔴 Research data from collaborators
- 🔴 Confidential communications
- 🔴 Any data owned by others

---

## Data Classification Guide

### When In Doubt
- **Ask yourself:** "Would I be comfortable if this was public?"
- **If NO** → Don't save it
- **If YES** → Can be saved if it's useful

### Sanitization Examples

#### ❌ NOT Allowed
```typescript
// DO NOT SAVE:
// Connected to acme-corp.supabase.co
// User query: SELECT * FROM customers WHERE name = 'John Doe'
async function getClientData() {
  const response = await fetch('https://api.client-system.com/data', {
    headers: { 'Authorization': 'Bearer sk_live_XXXXX' }
  });
}
```

#### ✅ ALLOWED (Sanitized)
```typescript
// CAN SAVE:
// Pattern for connecting to external API with auth
// Key: Use environment variables for secrets, never hardcode
// Key: Validate and sanitize all user inputs from queries
async function fetchExternalData(endpoint: string, token: string) {
  const response = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return validateResponse(response);
}
```

---

## Security Controls

### At Application Level
- **Manual validation:** Users review before saving
- **No auto-save:** Requires explicit command (SAVE_REASONING, SAVE_PROMPT, etc.)
- **Preview before upload:** Show exactly what will be stored
- **Type validation:** Only permitted entry types allowed
- **Content scanning:** Warnings for potential secrets (API keys, passwords)

### At Database Level (Supabase)
- **Row Level Security (RLS):** Only user can access their own data
- **Encryption at rest:** All data encrypted in Postgres
- **User isolation:** UUID-based user_id on all records
- **No service account access:** Service role only via MCP server
- **Audit logging:** Track who accessed what and when

### At Server Level (MCP)
- **Service role key:** Stored securely in deployment environment only
- **Request validation:** All inputs validated
- **Rate limiting:** Prevent abuse
- **Timeout enforcement:** No long-running queries
- **Error handling:** No secrets in error messages

### At Transport Level
- **HTTPS only:** All communications encrypted
- **No logging credentials:** Filter environment variables
- **Secure headers:** Content-Security-Policy, X-Frame-Options, etc.
- **CORS validation:** Only trusted origins

---

## User Rights

### Access
- You can access and view all your data anytime
- You can export all your data in standard format (JSON, CSV)
- You can see who/what accessed your data (audit logs)

### Modification
- You can edit any entry anytime
- You can delete any entry and it's immediately removed
- You can archive entries instead of deleting

### Deletion
- **Soft delete (default):** 30-day grace period before hard delete
- **Hard delete (immediate):** Can request instant permanent removal
- **Account deletion:** Removes all associated data
- **Export before delete:** Download everything before deletion

### Portability
- Export full knowledge base as JSON
- Import to another system anytime
- No proprietary format (plain JSON + metadata)
- Data ownership never changes

---

## Updates & Changes

### Policy Changes
- Any significant change requires:
  1. Notification to you
  2. Review period (minimum 14 days)
  3. Explicit approval before applying
  4. Option to export data before change takes effect

### Versioning
- This policy version: v1.0 (January 2026)
- All previous versions available in git history
- Changes are granular and traceable

---

## Compliance & Standards

### Standards Followed
- **GDPR principles:** Even though you're the only user, we follow GDPR spirit
- **OWASP Top 10:** Security best practices
- **Principle of least privilege:** Only access data needed
- **Data minimization:** Collect only what's useful

### Regular Audits
- Security review quarterly
- Penetration testing annually
- Dependency updates and patching (automated)
- RLS policies reviewed for correctness

---

## Questions & Violations

### If you have questions about what's allowed:
- Check this policy first
- Ask before saving (better safe than sorry)
- Use the sanitization examples above

### If you suspect a violation:
- All changes are auditable via git
- Check git history: `git log --all -- docs/plan/privacy-policy.md`
- Report issues via standard channels

### If this policy is violated:
1. Issue is immediately created and tracked
2. Root cause analysis performed
3. Corrective action taken
4. You are notified
5. Safeguards are added to prevent recurrence

---

## Contact & Accountability

**Policy Owner:** @gabo  
**Last Review:** January 2026  
**Next Review:** April 2026  

This policy is binding. Any deviation from these principles is considered a bug and will be treated as such.

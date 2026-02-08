TASK: {{TASK}}

----
SYSTEM CONTEXT & RULES (MANDATORY):
{{RULES_CONTENT}}

----
SECURITY PROFILE: {{PROFILE_NAME}}
Description: {{PROFILE_DESC}}

SECURITY SETTINGS:
- Credentials Blocked: {{CREDENTIALS_BLOCKED}}
- PII Blocked: {{PII_BLOCKED}}
- Corporate Data Blocked: {{CORPORATE_BLOCKED}}
- Env Vars Blocked: {{ENV_VARS_BLOCKED}}

INSTRUCTIONS:
1. Search the knowledge base for existing patterns related to this task.
2. Check for known pitfalls.
3. Plan your implementation based on the retrieved knowledge.
4. Execute the task, adhering to the security profile.

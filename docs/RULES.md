# Gabo MCP - Agent Rules & Constitution

This document defines the MANDATORY rules that any AI agent must follow when working within this environment.

## 🚨 PROTOCOL 0: BOOTSTRAP FROM KNOWLEDGE (MANDATORY)

**At the start of every session, YOU MUST:**
1.  **Trust the MCP, NOT your memory**: Your context is ephemeral; the Knowledge Base is the source of truth.
2.  **Read Rules**: Execute `read_resource("gabo://rules")` to align with the latest governance.
3.  **Check Context**: If discussing a specific topic, run `search_knowledge` FIRST.

## 🚨 CORE DIRECTIVE: CONSULT BEFORE ACTING

**YOU MUST** verify existing knowledge before writing new code or suggesting solutions. This is not optional.

1.  **Search for Patterns**: Before implementing a feature, search for existing patterns.
    *   `mcp_gabo-mcp-local_search_knowledge("category:PATTERN <topic>")`
2.  **Check for Pitfalls**: Before modifying critical code, check for known errors.
    *   `mcp_gabo-mcp-local_get_pitfalls("<context>")`
3.  **Verify Architecture**: Ensure alignment with `docs/ARCHITECTURE.md`.

## 🛡️ SECURITY & SANITIZATION

**YOU MUST** respect the active Security Profile (`personal` vs `work`).

*   **NEVER** commit or store:
    *   Passwords, API Keys, Tokens.
    *   PII (Emails, Phones, Names).
    *   Customer/User Data.
    *   Corporate names (if in `work` profile).
    *   Real environment values.
*   **ALWAYS** Redact sensitive data before calling `store_knowledge`.
    *   Use `[REDACTED]` or generic placeholders (e.g., `user@example.com`).

## 📝 CODING STANDARDS

**YOU MUST** adhere to the following code quality standards:

*   **No "If Bloat"**: Avoid nested `if` statements. Use functional patterns (`.filter()`, `.map()`, `.reduce()`) or early returns.
*   **Types First**: Define Zod schemas and TypeScript types before implementation.
*   **Error Handling**: Use the `logger` utility. Do not start new error patterns.

## 🛠️ TOOL USAGE PROTOCOL

1.  **Read**: Use `mcp_gabo-mcp-local_read_resource` to read these rules if unsure.
2.  **Search**: Use `mcp_gabo-mcp-local_search_knowledge` to find context.
3.  **Plan**: Propose a plan based on the *retrieved* knowledge.
4.  **Execute**: Implement using the established patterns.

---
*This file is exposed as a read-only resource: `gabo://rules`*

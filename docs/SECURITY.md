# Security Policy

## Supported Versions

Currently, only the latest release is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

## Reporting a Vulnerability

Security is a top priority for `gabo-mcp`. If you believe you have found a security vulnerability in this project, **please do not report it through public GitHub issues.**

Instead, please report it via the following steps:
1. Review the details of your finding to ensure it is not a documented feature or test credential.
2. Send a descriptive report containing steps to reproduce the vulnerability. You can securely reach out to the project maintainers directly.

You should receive a response outlining the next steps and the expected timeline for a patch. We appreciate your efforts to responsibly disclose your findings, and we will make every effort to acknowledge your contributions.

## Secrets and Credentials
- **Never submit public issues, pull requests, or logs containing real production `MCP_API_KEY`s, `MONGODB_URI` links, or user data.**
- If you accidentally commit a real secret to a fork, revoke the token globally at its source (e.g., MongoDB Atlas or regenerate via `npm run generate:key`).

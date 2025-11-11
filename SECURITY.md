# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Snapshot With Gitignore, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

**Please do not open public issues for security vulnerabilities.**

### What to Include

When reporting a security issue, please include:

1. Description of the vulnerability
2. Steps to reproduce the issue
3. Potential impact of the vulnerability
4. Suggested fix (if any)

### Response Timeline

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a detailed response within 7 days
- We will notify you when the vulnerability has been fixed

## Security Best Practices

When using this tool:

1. **Never include sensitive files** - Always ensure your `.gitignore` properly excludes:
   - API keys and secrets
   - Environment files (`.env`)
   - Database credentials
   - Personal information
   - Authentication tokens

2. **Review before sharing** - Always review the generated snapshot before sharing it with AI services or other parties

3. **Use environment variables** - Store sensitive configuration in environment variables, not in code

4. **Keep dependencies updated** - Regularly update dependencies to patch known vulnerabilities

## Disclosure Policy

When a security vulnerability is confirmed:

1. A fix will be developed and tested
2. A security advisory will be published
3. The fix will be released as a patch version
4. The reporter will be credited (unless they wish to remain anonymous)

Thank you for helping keep Snapshot With Gitignore and its users safe!

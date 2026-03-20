/**
 * Shared email validation used by all API routes and client-side forms.
 *
 * Pattern blocks special characters (angle brackets, quotes, backticks,
 * semicolons, parentheses, braces, brackets, backslashes) and requires a
 * 2+ character alphabetic TLD. Intentionally simple to avoid ReDoS.
 */
const EMAIL_RE = /^[^\s@<>'"`;(){}[\]\\]+@[^\s@<>'"`;(){}[\]\\]+\.[a-zA-Z]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_RE.test(email);
}

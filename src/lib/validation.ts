// Field rules from PRD 8.2 (S2, S3, S12, M1) and PRD 5 (password rules).

export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}

// Same shape the database checks (profiles_email_format_check).
export function isValidEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
}

// 2 to 60 characters after trimming.
export function isValidFullName(value: string): boolean {
  const length = value.trim().length;
  return length >= 2 && length <= 60;
}

// At least 8 characters, with at least 1 letter and 1 number.
export function isValidPassword(value: string): boolean {
  return value.length >= 8 && /\p{L}/u.test(value) && /\p{N}/u.test(value);
}

// Optional. +27 followed by 9 digits; spaces are allowed ("+27 82 123 4567").
export function isValidPhone(value: string): boolean {
  const compact = value.replace(/\s/g, '');
  return compact === '' || /^\+27\d{9}$/.test(compact);
}

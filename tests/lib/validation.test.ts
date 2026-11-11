import {
  isValidEmail,
  isValidFullName,
  isValidPassword,
  isValidPhone,
  normaliseEmail,
} from '../../src/lib/validation';

// Field rules from PRD 8.2 (S2, S3, S12, M1).
describe('isValidPassword (PRD 5, S2, S12)', () => {
  it('accepts 8+ characters with a letter and a number, like "kasi2026"', () => {
    expect(isValidPassword('kasi2026')).toBe(true);
  });

  it('rejects "kasikasi" because it has no number (T-US1-3)', () => {
    expect(isValidPassword('kasikasi')).toBe(false);
  });

  it('rejects a password with no letter', () => {
    expect(isValidPassword('20262026')).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(isValidPassword('kasi202')).toBe(false);
  });

  it('accepts letters outside a to z, like "ŝ"', () => {
    expect(isValidPassword('ŝikasi20')).toBe(true);
  });
});

describe('isValidFullName (S2: 2 to 60 characters)', () => {
  it('accepts "Thandeka Mokoena"', () => {
    expect(isValidFullName('Thandeka Mokoena')).toBe(true);
  });

  it('rejects a name that is only spaces or 1 character', () => {
    expect(isValidFullName('   ')).toBe(false);
    expect(isValidFullName(' T ')).toBe(false);
  });

  it('rejects a name longer than 60 characters', () => {
    expect(isValidFullName('a'.repeat(61))).toBe(false);
    expect(isValidFullName('a'.repeat(60))).toBe(true);
  });
});

describe('isValidEmail and normaliseEmail', () => {
  it('accepts a normal email address', () => {
    expect(isValidEmail('thandeka.m@example.com')).toBe(true);
  });

  it('rejects addresses without a domain or with spaces', () => {
    expect(isValidEmail('thandeka.m@')).toBe(false);
    expect(isValidEmail('thandeka m@example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('lower-cases and trims the email (S2 rule)', () => {
    expect(normaliseEmail('  Thandeka.M@Example.COM ')).toBe('thandeka.m@example.com');
  });
});

describe('isValidPhone (S2: optional, +27 followed by 9 digits)', () => {
  it('accepts an empty value because the field is optional', () => {
    expect(isValidPhone('')).toBe(true);
    expect(isValidPhone('   ')).toBe(true);
  });

  it('accepts "+27 82 123 4567" with or without spaces', () => {
    expect(isValidPhone('+27 82 123 4567')).toBe(true);
    expect(isValidPhone('+27821234567')).toBe(true);
  });

  it('rejects local numbers and wrong lengths', () => {
    expect(isValidPhone('082555')).toBe(false);
    expect(isValidPhone('0821234567')).toBe(false);
    expect(isValidPhone('+2782123456')).toBe(false);
  });
});

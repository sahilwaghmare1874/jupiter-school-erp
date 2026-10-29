/**
 * core/utils/form-validators.ts
 * ──────────────────────────────
 * Reusable Angular validators for sanitization and normalization.
 *
 * SDLC Phase 3 — Implementation: Frontend (Layer 1) sanitization pipeline.
 */
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ── Phone Validators ──────────────────────────────────────────────────────────

/**
 * Validates Indian phone numbers.
 * Accepts: +91 98220 12345, 9822012345, 98220-12345
 */
export function indiaPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value?.toString().trim() || '';
    if (!value) return null; // let required handle empty
    const digits = value.replace(/[\s\-\.\(\)+]/g, '');
    const core = digits.replace(/^(91|0091|091|0)/, '');
    if (!/^\d{10}$/.test(core)) {
      return { phone: 'Enter a valid 10-digit Indian mobile number. E.g. +91 98220 12345' };
    }
    return null;
  };
}

// ── Email Validator ───────────────────────────────────────────────────────────

export function strictEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value?.toString().trim() || '';
    if (!value) return null;
    const emailRe = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRe.test(value)) {
      return { email: 'Enter a valid email address. E.g. name@domain.com' };
    }
    return null;
  };
}

// ── Date Validators ───────────────────────────────────────────────────────────

/** Rejects future dates (for DOB, past event dates) */
export function notFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) return null;
    const date = new Date(value);
    if (date > new Date()) {
      return { futureDate: 'Date cannot be in the future.' };
    }
    return null;
  };
}

/** Rejects past dates (for future-only fields) */
export function notPastDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(value) < today) {
      return { pastDate: 'Date cannot be in the past.' };
    }
    return null;
  };
}

// ── Date Range Cross-Field Validator ─────────────────────────────────────────

/**
 * Cross-field validator for a form GROUP.
 * Validates that the control named `endField` >= control named `startField`.
 *
 * Usage:
 *   fb.group({ start_date: [...], end_date: [...] }, { validators: dateRangeValidator('start_date', 'end_date') })
 */
export function dateRangeValidator(startField: string, endField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startField)?.value;
    const end = group.get(endField)?.value;
    if (!start || !end) return null;
    if (new Date(end) < new Date(start)) {
      group.get(endField)?.setErrors({ dateRange: 'End date must be on or after start date.' });
      return { dateRange: 'End date must be on or after start date.' };
    }
    // Clear date range error if valid (preserving other errors)
    const endErrors = group.get(endField)?.errors;
    if (endErrors?.['dateRange']) {
      const { dateRange: _, ...rest } = endErrors;
      group.get(endField)?.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}

// ── Text/XSS Sanitizers ───────────────────────────────────────────────────────

/** Strip HTML tags from a string (client-side XSS prevention for display) */
export function stripHtml(text: string): string {
  if (!text) return text;
  return text.replace(/<[^>]*>/g, '').trim();
}

/** Normalize phone to +91 XXXXX XXXXX format */
export function normalizePhone(phone: string): string {
  if (!phone) return phone;
  const digits = phone.replace(/[\s\-\.\(\)+]/g, '').replace(/^(91|0091|091|0)/, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/** Normalize email: lowercase and trim */
export function normalizeEmail(email: string): string {
  return email?.toLowerCase().trim() || email;
}

/** Normalize name: trim and title-case */
export function normalizeName(name: string): string {
  if (!name) return name;
  return name.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ── Min/Max Length Custom Messages ───────────────────────────────────────────

export function minLengthMessage(min: number): string {
  return `Must be at least ${min} characters.`;
}

export function maxLengthMessage(max: number): string {
  return `Must be no more than ${max} characters.`;
}

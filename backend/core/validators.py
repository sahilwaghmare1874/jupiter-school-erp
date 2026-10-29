"""
core/validators.py
──────────────────
Reusable field-level validators and sanitization utilities for the Jupiter ERP.

SDLC Phase 3 — Implementation: Sanitization & Normalization Layer
"""
import re
import html
from datetime import date

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator


# ── Phone Validators ─────────────────────────────────────────────────────────

def normalize_phone(phone: str) -> str:
    """
    Normalize an Indian phone number to +91 XXXXX XXXXX format.
    - Strips spaces, dashes, dots
    - Adds +91 prefix if missing
    - Raises ValidationError if not 10 digits after stripping
    """
    if not phone:
        return phone
    digits = re.sub(r'[\s\-\.\(\)]', '', phone)
    # Remove country code variants: +91, 0091, 091
    digits = re.sub(r'^(\+91|0091|091|0)', '', digits)
    if not re.fullmatch(r'\d{10}', digits):
        raise ValidationError(
            'Enter a valid 10-digit Indian mobile number. Example: +91 98220 12345'
        )
    return f'+91 {digits[:5]} {digits[5:]}'


phone_validator = RegexValidator(
    regex=r'^(\+91[\s\-]?\d{5}[\s\-]?\d{5}|[6-9]\d{9})$',
    message='Enter a valid Indian phone number. Example: +91 98220 12345 or 9822012345'
)


# ── Text Sanitizers ───────────────────────────────────────────────────────────

_HTML_TAG_RE = re.compile(r'<[^>]+>')
_MULTI_SPACE_RE = re.compile(r'\s+')


def strip_html(text: str) -> str:
    """Remove all HTML tags and decode HTML entities. Prevents stored XSS."""
    if not text:
        return text
    # First unescape then strip tags
    text = html.unescape(text)
    text = _HTML_TAG_RE.sub('', text)
    # Normalize whitespace (collapse multiple spaces/newlines to single)
    text = _MULTI_SPACE_RE.sub(' ', text).strip()
    return text


def normalize_name(name: str) -> str:
    """Strip whitespace and title-case a person's name."""
    if not name:
        return name
    return ' '.join(word.capitalize() for word in name.strip().split())


def normalize_email(email: str) -> str:
    """Lowercase and strip whitespace from an email address."""
    if not email:
        return email
    return email.strip().lower()


def normalize_text(text: str, max_length: int = None) -> str:
    """Strip HTML, normalize whitespace. Optionally truncate to max_length."""
    if not text:
        return text
    text = strip_html(text)
    if max_length and len(text) > max_length:
        raise ValidationError(f'This field must be at most {max_length} characters. Got {len(text)}.')
    return text


# ── Date Validators ───────────────────────────────────────────────────────────

def validate_not_future_date(value):
    """Ensure a date is not in the future (for DOB, past records)."""
    if value and value > date.today():
        raise ValidationError('Date cannot be in the future.')


def validate_date_range(start_date, end_date):
    """Cross-field: end_date must be >= start_date."""
    if start_date and end_date and end_date < start_date:
        raise ValidationError('End date must be on or after the start date.')


# ── Marks / Percentage Validators ────────────────────────────────────────────

def validate_marks_range(marks_obtained, total_marks):
    """Cross-field: marks_obtained must not exceed total_marks."""
    if marks_obtained is not None and total_marks is not None:
        if float(marks_obtained) > float(total_marks):
            raise ValidationError(
                f'Marks obtained ({marks_obtained}) cannot exceed total marks ({total_marks}).'
            )
        if float(marks_obtained) < 0:
            raise ValidationError('Marks obtained cannot be negative.')


# ── URL Validators ────────────────────────────────────────────────────────────

def sanitize_url(url: str) -> str:
    """Ensure URL starts with http:// or https:// — no javascript: protocol."""
    if not url:
        return url
    url = url.strip()
    if url and not re.match(r'^https?://', url, re.IGNORECASE):
        raise ValidationError('URL must start with http:// or https://')
    return url

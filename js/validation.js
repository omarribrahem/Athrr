// js/validation.js

/**
 * ✅ Enhanced Email Validation (RFC 5322 compliant)
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, error: string, email: string }
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'البريد الإلكتروني مطلوب' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Enhanced email regex (RFC 5322 simplified)
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'صيغة البريد الإلكتروني غير صحيحة' };
  }

  // Check length
  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'البريد الإلكتروني طويل جداً' };
  }

  // Block suspicious patterns
  const suspiciousPatterns = [
    /\.{2,}/, // double dots
    /@.*@/, // multiple @
    /^\./, // starts with dot
    /\.$/, // ends with dot
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedEmail)) {
      return { valid: false, error: 'البريد الإلكتروني غير صحيح' };
    }
  }

  // Block disposable email domains
  const disposableDomains = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ];

  const domain = trimmedEmail.split('@')[1];
  if (disposableDomains.some(d => domain.endsWith(d))) {
    return { valid: false, error: 'هذا البريد الإلكتروني غير مسموح به' };
  }

  return { valid: true, email: trimmedEmail };
};

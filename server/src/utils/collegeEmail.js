/**
 * College Email Domain Validation Utility
 *
 * Provides domain normalization, syntax validation, configuration validation,
 * and registration email verification.
 */

/**
 * Normalizes a domain string by trimming, lowercasing, and stripping leading '@'.
 * @param {string} domain
 * @returns {string}
 */
export const normalizeDomain = (domain) => {
  if (typeof domain !== 'string') return '';
  return domain.trim().toLowerCase().replace(/^@+/, '');
};

/**
 * Checks if a domain is set to an unrestricted wildcard ('all' or '*').
 * @param {string} domain
 * @returns {boolean}
 */
export const isUnrestrictedDomain = (domain) => {
  const normalized = normalizeDomain(domain);
  return normalized === 'all' || normalized === '*';
};

/**
 * Checks if a domain string is syntactically valid.
 * Requires at least two labels separated by dot, valid characters, and valid length.
 * Wildcards ('all', '*') and single words are not valid domains.
 * @param {string} domain
 * @returns {boolean}
 */
export const isValidDomain = (domain) => {
  const normalized = normalizeDomain(domain);
  if (!normalized || isUnrestrictedDomain(normalized)) {
    return false;
  }

  // Domain syntax:
  // - Must not start or end with a dot or hyphen
  // - Must contain at least one dot
  // - Labels must be 1-63 chars, containing alphanumeric and hyphens (not leading/trailing hyphens)
  // - Total length <= 253 chars
  if (normalized.length > 253) return false;

  const domainRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
  return domainRegex.test(normalized);
};

/**
 * Validates the college domain configuration based on environment.
 * In production:
 *   - Domain must be provided (cannot be empty/missing)
 *   - Domain cannot be 'all' or '*'
 *   - Domain must be a valid domain format
 * In non-production (development/test):
 *   - 'all' or '*' is permitted for unrestricted local testing
 *   - Otherwise must be a valid domain format
 *
 * @param {Object} options
 * @param {string} options.domain - The configured COLLEGE_EMAIL_DOMAIN
 * @param {string} options.nodeEnv - The active NODE_ENV ('production', 'development', 'test')
 * @returns {{ valid: boolean, domain?: string, unrestricted?: boolean, error?: string }}
 */
export const validateCollegeDomainConfig = ({ domain, nodeEnv = 'development' } = {}) => {
  const isProd = nodeEnv === 'production';
  const normalized = normalizeDomain(domain);

  if (isProd) {
    if (!normalized) {
      return {
        valid: false,
        error: 'COLLEGE_EMAIL_DOMAIN environment variable is missing or empty. A valid college domain is required in production.',
      };
    }

    if (isUnrestrictedDomain(normalized)) {
      return {
        valid: false,
        error: `COLLEGE_EMAIL_DOMAIN cannot be set to unrestricted "${normalized}" in production. Please configure your institution's official email domain.`,
      };
    }

    if (!isValidDomain(normalized)) {
      return {
        valid: false,
        error: `COLLEGE_EMAIL_DOMAIN "${domain}" is not a valid domain name. Please specify a valid domain (e.g. yourcollege.edu).`,
      };
    }

    return {
      valid: true,
      domain: normalized,
      unrestricted: false,
    };
  }

  // Non-production (development / test)
  if (isUnrestrictedDomain(normalized)) {
    return {
      valid: true,
      domain: normalized,
      unrestricted: true,
    };
  }

  if (!normalized) {
    return {
      valid: false,
      error: 'COLLEGE_EMAIL_DOMAIN is empty.',
    };
  }

  if (!isValidDomain(normalized)) {
    return {
      valid: false,
      error: `COLLEGE_EMAIL_DOMAIN "${domain}" is invalid. Must be a valid domain (e.g. yourcollege.edu), "all", or "*".`,
    };
  }

  return {
    valid: true,
    domain: normalized,
    unrestricted: false,
  };
};

/**
 * Validates a student email during registration.
 *
 * @param {string} email - The email to test
 * @param {string} configuredDomain - The configured COLLEGE_EMAIL_DOMAIN
 * @param {string} nodeEnv - The active NODE_ENV
 * @returns {{ valid: boolean, email?: string, status?: number, configError?: boolean, message?: string }}
 */
export const validateRegistrationEmail = (email, configuredDomain, nodeEnv = 'development') => {
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      status: 400,
      message: 'Please provide a valid email address format',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return {
      valid: false,
      status: 400,
      message: 'Please provide a valid email address format',
    };
  }

  const config = validateCollegeDomainConfig({ domain: configuredDomain, nodeEnv });
  if (!config.valid) {
    return {
      valid: false,
      status: 500,
      configError: true,
      message: `Server configuration error: ${config.error}`,
    };
  }

  if (config.unrestricted) {
    return {
      valid: true,
      email: normalizedEmail,
    };
  }

  const emailDomain = normalizedEmail.split('@').pop();
  if (emailDomain !== config.domain) {
    return {
      valid: false,
      status: 400,
      message: `Please use your valid college email address ending with @${config.domain}`,
    };
  }

  return {
    valid: true,
    email: normalizedEmail,
  };
};

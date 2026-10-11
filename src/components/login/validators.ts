// Ports of monkeytype's zod schemas (zod 3.23.8 messages): UserNameSchema, UserEmailSchema, NewPasswordSchema.
import { TYPO_LIST } from "./typo-list";

export const NOT_AVAILABLE_MESSAGE = "Accounts are not available in this clone";

export function validateUsername(value: string): string[] {
  const errors: string[] = [];
  if (value.length < 1) errors.push("String must contain at least 1 character(s)");
  if (value.length > 16) errors.push("String must contain at most 16 character(s)");
  if (!/^[0-9a-zA-Z_.-]+$/.test(value)) errors.push("Only letters, numbers, underscores, dots and hyphens allowed");
  if (!/^[^.].*$/.test(value)) errors.push("Cannot start with a dot");
  return errors;
}

// zod 3 email regex
const EMAIL_REGEX = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

export function validateEmail(value: string): string[] {
  return EMAIL_REGEX.test(value) ? [] : ["Invalid email"];
}

export function emailWarnings(email: string): string[] {
  const warnings: string[] = [];
  if (/@.*(student|education|school|\.edu$|\.edu\.|\.ac\.|\.sch\.)/i.test(email)) {
    warnings.push(
      "Some education emails will fail to receive our messages, or disable the account as soon as you graduate. Consider using a personal email address.",
    );
  }
  if (TYPO_LIST.some((typo) => email.endsWith(typo))) {
    warnings.push("Please check your email address, it may contain a typo.");
  }
  return warnings;
}

export function validateNewPassword(value: string): string[] {
  const errors: string[] = [];
  if (value.length < 8) errors.push("must be at least 8 characters");
  if (value.length > 64) errors.push("must be at most 64 characters");
  if (!/[A-Z]/.test(value)) errors.push("must contain at least one capital letter");
  if (!/[\d]/.test(value)) errors.push("must contain at least one number");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) errors.push("must contain at least one special character");
  return errors;
}

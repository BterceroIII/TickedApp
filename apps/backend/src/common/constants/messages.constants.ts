export const AUTH_MESSAGES = {
  // Success messages
  ACCOUNT_CREATED: 'Account created successfully',
  ACCOUNT_CONFIRMED: 'Account confirmed successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_CORRECT: 'Password is correct',
  PROFILE_UPDATED: 'Profile updated successfully',
  CHECK_EMAIL: 'Check your email for instructions',
  TOKEN_VALID: 'Token is valid, set your new password',

  // Error messages
  EMAIL_EXISTS: 'An account with this email is already registered',
  INVALID_TOKEN: 'Invalid token',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_NOT_CONFIRMED: 'Account is not confirmed',
  INCORRECT_PASSWORD: 'Incorrect password',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  EMAIL_REGISTERED: 'This email is already registered by another user',
  GENERIC_ERROR: 'An error occurred',
  DB_CONNECTION_ERROR: 'Unable to connect to database',
} as const;

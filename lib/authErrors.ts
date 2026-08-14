export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Something went wrong. Please try again.';
  }

  const message =
    'message' in error && typeof error.message === 'string'
      ? error.message.toLowerCase()
      : '';

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }
  if (message.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (message.includes('password should be at least')) {
    return 'Password must be at least 6 characters.';
  }
  if (message.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }
  if (message.includes('signup is disabled')) {
    return 'Registration is currently disabled.';
  }
  if (message.includes('network')) {
    return 'Network error. Check your connection and try again.';
  }
  if (message.includes('popup closed') || message.includes('user cancelled')) {
    return 'Sign-in was cancelled.';
  }
  if (message.includes('password is required')) {
    return 'Password is required to delete your account.';
  }

  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

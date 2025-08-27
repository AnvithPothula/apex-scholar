/**
 * Utility to convert Firebase error codes to user-friendly messages
 * @param {Error} error - Firebase error object
 * @returns {string} - User-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  // Check if error has a code property (Firebase error)
  const errorCode = error?.code || error?.message || '';
  
  // Firebase Auth Error Messages
  const authErrorMessages = {
    // Popup and OAuth errors
    'auth/popup-blocked': 'Your browser is blocking popups. Please allow popups for this site and try again, or use email/password to sign in.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again if you want to continue.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
    'auth/unauthorized-domain': 'This domain is not authorized for OAuth operations. Please contact support.',
    
    // Network and connectivity errors
    'auth/network-request-failed': 'Network connection error. Please check your internet connection and try again.',
    'auth/timeout': 'Request timed out. Please check your internet connection and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes before trying again.',
    
    // Email/Password errors
    'auth/user-not-found': 'No account found with this email address. Please check your email or create a new account.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support for assistance.',
    'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead or use a different email.',
    'auth/weak-password': 'Password should be at least 6 characters long. Please choose a stronger password.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/invalid-credential': 'Invalid login credentials. Please check your email and password.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method. Please use the original sign-in method.',
    'auth/credential-already-in-use': 'This credential is already associated with a different account.',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Invalid verification ID. Please try again.',
    'auth/missing-verification-code': 'Please enter the verification code.',
    'auth/missing-verification-id': 'Verification ID is missing. Please try again.',
    
    // User management errors
    'auth/requires-recent-login': 'This action requires recent authentication. Please sign out and sign back in.',
    'auth/provider-already-linked': 'This account is already linked to this provider.',
    'auth/no-such-provider': 'This account is not linked to this provider.',
    'auth/invalid-user-token': 'Your session has expired. Please sign in again.',
    'auth/user-token-expired': 'Your session has expired. Please sign in again.',
    'auth/null-user': 'No user is currently signed in.',
    'auth/invalid-api-key': 'Invalid API key. Please contact support.',
    'auth/app-deleted': 'This app has been deleted. Please contact support.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid. Please request a new one.',
    'auth/invalid-message-payload': 'Invalid email template. Please contact support.',
    'auth/invalid-sender': 'Invalid email sender. Please contact support.',
    'auth/invalid-recipient-email': 'Invalid recipient email address.',
    'auth/missing-android-pkg-name': 'Android package name is required.',
    'auth/missing-continue-uri': 'Continue URL is required.',
    'auth/missing-ios-bundle-id': 'iOS bundle ID is required.',
    'auth/unauthorized-continue-uri': 'Continue URL is not authorized.',
    'auth/invalid-continue-uri': 'Invalid continue URL.',
    'auth/missing-email': 'Email address is required.',
    'auth/missing-password': 'Password is required.',
  };

  // Firestore Error Messages
  const firestoreErrorMessages = {
    'permission-denied': 'You don\'t have permission to access this data. Please make sure you\'re signed in.',
    'unavailable': 'Service is temporarily unavailable. Please check your internet connection and try again.',
    'not-found': 'The requested data was not found.',
    'already-exists': 'This data already exists.',
    'resource-exhausted': 'Service quota exceeded. Please try again later.',
    'failed-precondition': 'The operation failed due to a precondition. Please try again.',
    'aborted': 'The operation was aborted. Please try again.',
    'out-of-range': 'The operation was out of range.',
    'unimplemented': 'This operation is not implemented.',
    'internal': 'Internal server error. Please try again later.',
    'deadline-exceeded': 'The operation timed out. Please try again.',
    'data-loss': 'Data loss occurred. Please contact support.',
    'unauthenticated': 'You need to be signed in to perform this action.',
  };

  // Check auth errors first
  if (authErrorMessages[errorCode]) {
    return authErrorMessages[errorCode];
  }

  // Check firestore errors
  if (firestoreErrorMessages[errorCode]) {
    return firestoreErrorMessages[errorCode];
  }

  // Check for common error patterns in the message
  const errorMessage = error?.message || '';
  
  if (errorMessage.includes('popup') && errorMessage.includes('blocked')) {
    return 'Your browser is blocking popups. Please allow popups for this site and try again, or use email/password to sign in.';
  }
  
  if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
    return 'Connection error. Please check your internet connection and try refreshing the page.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('Network')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
    return 'Service limit reached. Please try again in a few minutes.';
  }
  
  // Default fallback message
  return 'Something went wrong. Please try again or contact support if the problem persists.';
};

/**
 * Generates a random 8-digit alphanumeric referral code
 * Format: 8 characters using letters (A-Z) and numbers (0-9)
 * This code is dedicated and will not change for the user
 */
export const generateReferralCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Generates a referral code with a prefix
 * @param prefix - The prefix to add (e.g., 'DRV', 'RID')
 * @returns Formatted referral code with prefix
 */
export const generateReferralCodeWithPrefix = (prefix: string): string => {
  return `${prefix}${generateReferralCode()}`;
};

/**
 * Validates if a referral code is in the correct format
 * @param code - The code to validate
 * @returns true if valid, false otherwise
 */
export const isValidReferralCode = (code: string): boolean => {
  const regex = /^[A-Z0-9]{8}$/;
  return regex.test(code);
};

/**
 * Validates if a referral code with prefix is in the correct format
 * @param code - The code to validate (e.g., 'DRVABC12345')
 * @returns true if valid, false otherwise
 */
export const isValidReferralCodeWithPrefix = (code: string): boolean => {
  const regex = /^[A-Z]{3}[A-Z0-9]{8}$/;
  return regex.test(code);
};

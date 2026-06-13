/**
 * Generate a random 6-character token for email verification
 * @returns Random 6-character token
 */
export const generateToken = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';

  for (let i = 0; i < 6; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return token;
};

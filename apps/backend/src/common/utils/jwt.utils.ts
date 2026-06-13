import * as jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user authentication
 * @param userId - User ID to encode in the token
 * @returns JWT token
 */
export const generateJWT = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  const token = jwt.sign({ id: userId }, secret, {
    expiresIn: '30d',
  });

  return token;
};

export const verifyJWT = (token: string): any => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  return jwt.verify(token, secret);
};

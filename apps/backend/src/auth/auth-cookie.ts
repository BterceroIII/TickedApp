import type { CookieOptions } from 'express';

export const authCookieName =
  process.env.NODE_ENV === 'production'
    ? '__Host-tickedapp.session'
    : 'tickedapp.session';

export const authCookieNames = [authCookieName, 'tickedapp.session'] as const;

export const authCookieMaxAge = 1000 * 60 * 60 * 24 * 30;

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: authCookieMaxAge,
  };
}

export function getClearAuthCookieOptions(): CookieOptions {
  const { maxAge, ...options } = getAuthCookieOptions();
  void maxAge;
  return options;
}

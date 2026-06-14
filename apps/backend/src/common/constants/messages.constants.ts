export const AUTH_MESSAGES = {
  // Success messages
  ACCOUNT_CREATED: 'Cuenta creada correctamente',
  ACCOUNT_CONFIRMED: 'Cuenta confirmada correctamente',
  PASSWORD_CHANGED: 'Contraseña actualizada correctamente',
  PASSWORD_CORRECT: 'La contraseña es correcta',
  PROFILE_UPDATED: 'Perfil actualizado correctamente',
  CHECK_EMAIL: 'Revisa tu correo para continuar',
  TOKEN_VALID: 'El token es válido, define tu nueva contraseña',

  // Error messages
  EMAIL_EXISTS: 'Ya existe una cuenta registrada con este correo',
  INVALID_TOKEN: 'Token inválido',
  USER_NOT_FOUND: 'El usuario no existe',
  ACCOUNT_NOT_CONFIRMED: 'La cuenta no está confirmada',
  INCORRECT_PASSWORD: 'Contraseña incorrecta',
  CURRENT_PASSWORD_INCORRECT: 'La contraseña actual es incorrecta',
  EMAIL_REGISTERED: 'Este correo ya está registrado por otro usuario',
  GENERIC_ERROR: 'Ocurrió un error',
  DB_CONNECTION_ERROR: 'No se pudo conectar con la base de datos',
} as const;

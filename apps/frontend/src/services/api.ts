import axios from "axios"

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1"
export const AUTH_TOKEN_STORAGE_KEY = "tickedapp.auth.token"

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const errorTranslations: Record<string, string> = {
  "User not found": "El usuario no existe",
  "Not Found": "Recurso no encontrado",
  "Account is not confirmed": "La cuenta no está confirmada",
  "Incorrect password": "Contraseña incorrecta",
  "Invalid token": "Token inválido",
  "An account with this email is already registered":
    "Ya existe una cuenta registrada con este correo",
  "An error occurred": "Ocurrió un error",
  "Internal server error": "Ocurrió un error interno",
}

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "Ocurrió un error inesperado"
  }

  const message = toErrorText(error.response?.data.message)

  return (
    translateError(message) ??
    translateError(error.response?.data.error) ??
    "No se pudo completar la solicitud"
  )
}

function toErrorText(message: ApiErrorResponse["message"]): string | undefined {
  if (!message) return undefined

  if (Array.isArray(message)) {
    return message.map(toErrorText).filter(Boolean).join(". ")
  }

  if (typeof message === "object") {
    return toErrorText(message.message) ?? message.error
  }

  return translateError(String(message))
}

function translateError(message: string | undefined) {
  if (!message) return undefined

  return errorTranslations[message] ?? message
}

export type ApiErrorResponse = {
  message?: string | string[] | { message?: string | string[]; error?: string }
  error?: string
  statusCode?: number
}

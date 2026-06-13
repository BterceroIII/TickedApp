import axios from "axios"

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1"

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "Ocurrió un error inesperado"
  }

  const message = error.response?.data.message

  if (Array.isArray(message)) {
    return message.join(". ")
  }

  return message ?? error.response?.data.error ?? "No se pudo completar la solicitud"
}

export type ApiErrorResponse = {
  message?: string | string[]
  error?: string
  statusCode?: number
}

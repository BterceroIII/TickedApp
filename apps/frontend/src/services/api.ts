import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1"

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

export type ApiErrorResponse = {
  message?: string | string[]
  error?: string
  statusCode?: number
}

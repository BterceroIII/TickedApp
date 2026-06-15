import { z } from "zod"

export const PROJECT_DESCRIPTION_MAX_LENGTH = 500
export const TICKET_DESCRIPTION_MAX_LENGTH = 500
export const INVOICE_AMOUNT_MAX = 9_999_999_999

const optionalTrimmedString = (maxLength: number, message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength, { message }).optional()
  )

const requiredFutureDate = (message: string) =>
  z
    .string()
    .min(1, { message })
    .refine((value) => isFutureOrToday(value), {
      message: "La fecha no puede ser pasada",
    })

const requiredDate = (message: string) =>
  z
    .string()
    .min(1, { message })
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
      message: "Selecciona una fecha válida",
    })

function isFutureOrToday(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return date >= today
}

export const ResponseSchema = z.object({
  succeeded: z.boolean().optional(),
  message: z.string(),
  title: z.string().optional(),
  statusCode: z.number().optional(),
})

export const UserSchema = z.object({
  id: z.string().uuid({ message: "Selecciona un responsable válido" }),
  name: z.string().nullable().optional(),
  email: z.email({ message: "Ingresa un email válido" }),
})

export const ProjectStatusSchema = z.enum([
  "EN_PROGRESO",
  "EN_REVISION",
  "PLANIFICACION",
  "COMPLETADO",
], { message: "Selecciona un estado válido" })

export const TicketStatusSchema = z.enum(["ABIERTO", "EN_PROCESO", "RESUELTO"], {
  message: "Selecciona un estado válido",
})

export const TicketPrioritySchema = z.enum(["ALTA", "MEDIA", "BAJA"], {
  message: "Selecciona una prioridad válida",
})

export const InvoiceStatusSchema = z.enum(["PENDIENTE", "VENCIDA", "PAGADA"], {
  message: "Selecciona un estado válido",
})

export const LoginSchema = z.object({
  email: z.email({ message: "Ingresa un email válido" }),
  password: z.string().min(1, { message: "Ingresa tu contraseña" }),
})

export const SignupSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Ingresa tu nombre" }),
    email: z.email({ message: "Ingresa un email válido" }),
    password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
    confirmPassword: z.string().min(1, { message: "Confirma tu contraseña" }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export const OtpSchema = z.object({
  token: z.string().regex(/^\d{6}$/, { message: "Ingresa un código de 6 dígitos" }),
})

export const ProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  status: ProjectStatusSchema,
  responsibleId: z.string(),
  responsible: UserSchema.optional(),
  dateLimit: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, { message: "El nombre del proyecto no puede estar vacío" }),
  responsible: z.string().min(1, { message: "Selecciona un usuario responsable" }).uuid({ message: "Selecciona un responsable válido" }),
  dateLimit: requiredFutureDate("Selecciona una fecha límite"),
  status: ProjectStatusSchema,
  description: optionalTrimmedString(
    PROJECT_DESCRIPTION_MAX_LENGTH,
    `La descripción del proyecto no puede superar ${PROJECT_DESCRIPTION_MAX_LENGTH} caracteres`
  ),
})

export const TickedSchema = z.object({
  id: z.string(),
  projectId: z.number(),
  project: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: TicketStatusSchema,
  priority: TicketPrioritySchema,
  estimatedDate: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
  assignedTo: UserSchema.optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateTickedSchema = z.object({
  title: z.string().trim().min(1, { message: "El título del ticket no puede estar vacío" }),
  projectId: z.coerce.number().int().positive({ message: "Selecciona un proyecto válido" }),
  priority: TicketPrioritySchema,
  status: TicketStatusSchema,
  estimatedDate: requiredFutureDate("Debe seleccionar una fecha válida"),
  assignedToId: z.string().min(1, { message: "Selecciona un usuario asignado" }).uuid({ message: "Selecciona un usuario válido" }),
  description: optionalTrimmedString(
    TICKET_DESCRIPTION_MAX_LENGTH,
    `La descripción del ticket no puede superar ${TICKET_DESCRIPTION_MAX_LENGTH} caracteres`
  ),
})

export const CreateInvoiceSchema = z.object({
  concept: z.string().trim().min(1, { message: "El concepto no puede estar vacío" }),
  amount: z.coerce
    .number()
    .int({ message: "El monto debe ser un número entero" })
    .positive({ message: "El monto debe ser mayor a cero" })
    .max(INVOICE_AMOUNT_MAX, { message: `El monto máximo permitido es ${INVOICE_AMOUNT_MAX}` }),
  status: InvoiceStatusSchema,
  dueDate: requiredDate("Selecciona una fecha límite"),
  paidAt: z.string().optional(),
})

export type ResponseType = z.infer<typeof ResponseSchema>
export type UserType = z.infer<typeof UserSchema>
export type ProjectType = z.infer<typeof ProjectSchema>
export type ProjectFormType = z.infer<typeof CreateProjectSchema>
export type TickedType = z.infer<typeof TickedSchema>
export type TickedFormType = z.infer<typeof CreateTickedSchema>
export type InvoiceFormType = z.infer<typeof CreateInvoiceSchema>
export type LoginFormType = z.infer<typeof LoginSchema>
export type SignupFormType = z.infer<typeof SignupSchema>
export type OtpFormType = z.infer<typeof OtpSchema>

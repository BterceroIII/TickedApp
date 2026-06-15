import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/services/api"
import { useCreateAccount } from "@/services/auth/auth.service"
import { SignupSchema } from "../../schema"

type FormErrors = Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const createAccountMutation = useCreateAccount()
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const result = SignupSchema.safeParse({
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      confirmPassword: String(formData.get("confirm-password")),
    })

    if (!result.success) {
      setErrors(getFormErrors(result.error.issues))
      return
    }

    setErrors({})

    createAccountMutation.mutate(
      {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message)
          void navigate({ to: "/otp" })
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error))
        },
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="justify-items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
            CP
          </div>
          <CardTitle className="text-xl">Crear cuenta</CardTitle>
          <CardDescription>
            Completa tus datos para activar el acceso al portal cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Sofía Morales"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  onChange={() => setErrors((current) => ({ ...current, name: undefined }))}
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="cliente@empresa.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  onChange={() => setErrors((current) => ({ ...current, email: undefined }))}
                />
                <FieldError>{errors.email}</FieldError>
              </Field>
              <Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                      onChange={() => setErrors((current) => ({ ...current, password: undefined }))}
                    />
                    <FieldError>{errors.password}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirmar contraseña
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.confirmPassword)}
                      onChange={() => setErrors((current) => ({ ...current, confirmPassword: undefined }))}
                    />
                    <FieldError>{errors.confirmPassword}</FieldError>
                  </Field>
                </div>
                <FieldDescription>
                  Debe tener al menos 8 caracteres.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={createAccountMutation.isPending}>
                  {createAccountMutation.isPending
                    ? "Creando cuenta..."
                    : "Registar"}
                </Button>
                <FieldDescription className="text-center">
                  ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Al continuar aceptas la verificación de tu cuenta por código OTP.
      </FieldDescription>
    </div>
  )
}

function getFormErrors(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.reduce<FormErrors>((errors, issue) => {
    const field = String(issue.path[0]) as keyof FormErrors
    if (!errors[field]) errors[field] = issue.message
    return errors
  }, {})
}

import { Link, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/services/api"
import { useLogin } from "@/services/auth/auth.service"
import { dashboardQueryOptions } from "@/services/dashboard/dashboard.service"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loginMutation = useLogin()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    loginMutation.mutate(
      {
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      },
      {
        onSuccess: async () => {
          queryClient.removeQueries({ queryKey: dashboardQueryOptions.queryKey })
          await queryClient.prefetchQuery(dashboardQueryOptions)
          toast.success("Sesión iniciada correctamente")
          void navigate({ to: "/" })
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
          <CardTitle className="text-xl">Bienvenido de vuelta</CardTitle>
          <CardDescription>
            Ingresa con tu cuenta para acceder al portal cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="cliente@empresa.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Link
                    to="/login"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Ingresando..." : "Entrar al dashboard"}
                </Button>
                <FieldDescription className="text-center">
                  ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { getApiErrorMessage } from "@/services/api"
import { useConfirmAccount } from "@/services/auth/auth.service"

export function OtpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [otp, setOtp] = useState("")
  const navigate = useNavigate()
  const confirmAccountMutation = useConfirmAccount()
  const isValidOtp = otp.length === 6

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isValidOtp) {
      return
    }

    confirmAccountMutation.mutate(
      { token: otp },
      {
        onSuccess: (data) => {
          toast.success(data.message)
          void navigate({ to: "/login" })
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
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verifica tu cuenta</CardTitle>
          <CardDescription>
            Ingresa el código de 6 dígitos enviado a tu correo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field className="items-center text-center">
                <FieldLabel htmlFor="otp" className="sr-only">
                  Código OTP
                </FieldLabel>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription className="text-center">
                  Usa el código de confirmación recibido por email.
                </FieldDescription>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={!isValidOtp || confirmAccountMutation.isPending}
                >
                  {confirmAccountMutation.isPending
                    ? "Validando..."
                    : "Validar código"}
                </Button>
                <FieldDescription className="text-center">
                  ¿Necesitas cambiar datos? <Link to="/register">Volver al registro</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Después de validar el OTP volverás al login para iniciar sesión.
      </FieldDescription>
    </div>
  )
}

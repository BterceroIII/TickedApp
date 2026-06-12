import { useEffect, type RefObject } from "react"
import { toast } from "sonner"

export type ActionState = {
  succeeded?: boolean
  message?: string
  title?: string
  reset?: boolean
}

type ErrorMessageProps = {
  state: ActionState
  formRef?: RefObject<HTMLFormElement | null>
  redirectTo?: string
  redirectDelay?: number
}

export default function ErrorMessage({
  state,
  formRef,
  redirectTo,
  redirectDelay = 2000,
}: ErrorMessageProps) {
  useEffect(() => {
    if (!state.message) return

    if (state.succeeded) {
      toast.success(state.message, {
        description: state.title,
      })
    } else {
      toast.error(state.message, {
        description: state.title,
      })
    }

    if (!state.succeeded) return

    if (state.reset && formRef?.current) {
      formRef.current.reset()
    }

    if (redirectTo) {
      setTimeout(() => {
        window.location.href = redirectTo
      }, redirectDelay)
    }
  }, [formRef, redirectDelay, redirectTo, state])

  return null
}

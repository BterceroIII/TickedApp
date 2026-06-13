import { createFileRoute } from "@tanstack/react-router"

import { SignupForm } from "@/components/signup-form"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-lg">
        <SignupForm />
      </div>
    </main>
  )
}

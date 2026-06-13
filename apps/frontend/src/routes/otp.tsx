import { createFileRoute } from "@tanstack/react-router"

import { OtpForm } from "@/components/otp-form"

export const Route = createFileRoute("/otp")({
  component: OtpPage,
})

function OtpPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-md">
        <OtpForm />
      </div>
    </main>
  )
}

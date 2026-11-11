"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth/auth-shell"
import {
  AnimatedError,
  MField,
  MGroup,
  SubmitButton,
} from "@/components/motion"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requestPasswordReset } from "@/lib/auth"
import { validateEmail } from "@/lib/validation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateEmail(email)
    setError(err)
    if (err) return
    setLoading(true)
    await requestPasswordReset(email)
    setLoading(false)
    toast.success("If that account exists, we sent a code. Demo code: 123456")
    router.push(
      `/verify-email?email=${encodeURIComponent(email)}&purpose=reset`
    )
  }

  return (
    <AuthShell
      title="Forgot password?"
      description="Enter your email and we'll send you a verification code"
      footer={
        <Link
          href="/signin"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" /> Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <MGroup>
          <MField data-invalid={!!error}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
            />
            <AnimatedError message={error} />
          </MField>
          <SubmitButton loading={loading}>Send code</SubmitButton>
        </MGroup>
      </form>
    </AuthShell>
  )
}

"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth/auth-shell"
import { PasswordInput } from "@/components/auth/password-input"
import { PasswordStrength } from "@/components/auth/password-strength"
import {
  AnimatedError,
  MField,
  MGroup,
  SubmitButton,
} from "@/components/motion"
import { FieldLabel } from "@/components/ui/field"
import { resetPassword } from "@/lib/auth"
import { validatePassword } from "@/lib/validation"

function ResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get("email") ?? ""
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [errors, setErrors] = React.useState<{
    password?: string
    confirm?: string
  }>({})
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = {
      password: validatePassword(password),
      confirm: confirm !== password ? "Passwords do not match." : "",
    }
    setErrors(errs)
    if (errs.password || errs.confirm) return
    setLoading(true)
    const res = await resetPassword(email, password)
    setLoading(false)
    if (!res.ok) return toast.error(res.error)
    toast.success("Password updated. Please sign in.")
    router.push("/signin")
  }

  return (
    <AuthShell
      title="Set new password"
      description="Choose a strong password for your account"
    >
      <form onSubmit={onSubmit} noValidate>
        <MGroup>
          <MField data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            <PasswordStrength value={password} />
            <AnimatedError message={errors.password} />
          </MField>
          <MField data-invalid={!!errors.confirm}>
            <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={!!errors.confirm}
            />
            <AnimatedError message={errors.confirm} />
          </MField>
          <SubmitButton loading={loading}>Update password</SubmitButton>
        </MGroup>
      </form>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense>
      <ResetForm />
    </React.Suspense>
  )
}

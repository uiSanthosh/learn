"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth/auth-shell"
import { PasswordInput } from "@/components/auth/password-input"
import { PasswordStrength } from "@/components/auth/password-strength"
import { SocialButtons } from "@/components/auth/social-buttons"
import {
  AnimatedError,
  MField,
  MGroup,
  SubmitButton,
} from "@/components/motion"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUp } from "@/lib/auth"
import { validateEmail, validateName, validatePassword } from "@/lib/validation"

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  })
  const [terms, setTerms] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: form.confirm !== form.password ? "Passwords do not match." : "",
      terms: terms ? "" : "You must accept the terms to continue.",
    }
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return
    setLoading(true)
    const res = await signUp(form.name, form.email, form.password)
    setLoading(false)
    if (!res.ok) return toast.error(res.error)
    toast.success("Account created! Check your email. Demo code: 123456")
    router.push(
      `/verify-email?email=${encodeURIComponent(form.email)}&purpose=signup`
    )
  }

  return (
    <AuthShell
      title="Create an account"
      description="Enter your details to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <MGroup>
          <SocialButtons />
          <MField data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={set("name")}
              aria-invalid={!!errors.name}
            />
            <AnimatedError message={errors.name} />
          </MField>
          <MField data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              aria-invalid={!!errors.email}
            />
            <AnimatedError message={errors.email} />
          </MField>
          <MField data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={set("password")}
              aria-invalid={!!errors.password}
            />
            <PasswordStrength value={form.password} />
            <AnimatedError message={errors.password} />
          </MField>
          <MField data-invalid={!!errors.confirm}>
            <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={set("confirm")}
              aria-invalid={!!errors.confirm}
            />
            <AnimatedError message={errors.confirm} />
          </MField>
          <MField data-invalid={!!errors.terms}>
            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={terms}
                onCheckedChange={(c) => setTerms(!!c)}
                aria-invalid={!!errors.terms}
              />
              <FieldLabel htmlFor="terms" className="font-normal">
                I agree to the Terms of Service and Privacy Policy
              </FieldLabel>
            </div>
            <AnimatedError message={errors.terms} />
          </MField>
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </MGroup>
      </form>
    </AuthShell>
  )
}

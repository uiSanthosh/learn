"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth/auth-shell"
import { PasswordInput } from "@/components/auth/password-input"
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
import { signIn } from "@/lib/auth"
import { validateEmail } from "@/lib/validation"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(true)
  const [errors, setErrors] = React.useState<{
    email?: string
    password?: string
  }>({})
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = {
      email: validateEmail(email),
      password: password ? "" : "Password is required.",
    }
    setErrors(errs)
    if (errs.email || errs.password) return
    setLoading(true)
    const res = await signIn(email, password)
    setLoading(false)
    if (!res.ok) return toast.error(res.error)
    if (!res.data.verified) {
      toast.info("Please verify your email to continue. Demo code: 123456")
      return router.push(
        `/verify-email?email=${encodeURIComponent(email)}&purpose=signup`
      )
    }
    toast.success("Welcome back!")
    router.push("/dashboard")
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your account to continue"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <MGroup>
          <SocialButtons />
          <MField data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            <AnimatedError message={errors.email} />
          </MField>
          <MField data-invalid={!!errors.password}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            <AnimatedError message={errors.password} />
          </MField>
          <MField orientation="horizontal">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(c) => setRemember(!!c)}
            />
            <FieldLabel htmlFor="remember" className="font-normal">
              Remember me
            </FieldLabel>
          </MField>
          <SubmitButton loading={loading}>Sign in</SubmitButton>
        </MGroup>
      </form>
    </AuthShell>
  )
}

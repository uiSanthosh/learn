"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth/auth-shell"
import { AnimatedError, MField, SubmitButton } from "@/components/motion"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { verifyCode } from "@/lib/auth"

function VerifyForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get("email") ?? ""
  const purpose = params.get("purpose") === "reset" ? "reset" : "signup"
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(30)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function submit(value: string) {
    if (value.length < 6) return setError("Enter the 6-digit code.")
    setError("")
    setLoading(true)
    const res = await verifyCode(email, value, purpose)
    setLoading(false)
    if (!res.ok) return setError(res.error)
    if (purpose === "signup") {
      toast.success("Email verified!")
      router.push("/dashboard")
    } else {
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&verified=1`
      )
    }
  }

  return (
    <AuthShell
      title="Check your email"
      description={`We sent a 6-digit code to ${email || "your email"}`}
      footer={
        <Link
          href="/signin"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" /> Back to sign in
        </Link>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(code)
        }}
        className="flex flex-col items-center gap-4"
      >
        <MField data-invalid={!!error} className="items-center">
          <InputOTP
            containerClassName="w-full"
            maxLength={6}
            value={code}
            onChange={(v) => {
              setCode(v)
              setError("")
              if (v.length === 6) submit(v)
            }}
            autoFocus
          >
            <InputOTPGroup className="w-full">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-12 flex-1 text-lg"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <AnimatedError message={error} />
        </MField>
        <SubmitButton loading={loading}>Verify</SubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={cooldown > 0}
          onClick={() => {
            setCooldown(30)
            toast.success("Code resent. Demo code: 123456")
          }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
      </form>
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense>
      <VerifyForm />
    </React.Suspense>
  )
}

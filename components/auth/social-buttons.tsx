"use client"

import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FieldSeparator } from "@/components/ui/field"

const MotionButton = motion.create(Button)

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.07 1.07-2.74 2.25-5.64 2.25-4.5 0-8.02-3.63-8.02-8.13S8.45 4.29 12.95 4.29c2.43 0 4.2.95 5.5 2.18l2.31-2.31C18.8 2.27 16.28.9 12.95.9 6.87.9 1.75 5.84 1.75 12.42s5.12 11.52 11.2 11.52c3.29 0 5.77-1.08 7.71-3.1 2-2 2.63-4.82 2.63-7.09 0-.7-.05-1.35-.16-1.88z"
    />
  </svg>
)
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
    <path
      fill="currentColor"
      d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"
    />
  </svg>
)

export function SocialButtons() {
  const soon = (p: string) => toast.info(`${p} sign-in is a demo placeholder.`)
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <MotionButton
          type="button"
          variant="outline"
          onClick={() => soon("Google")}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <GoogleIcon /> Google
        </MotionButton>
        <MotionButton
          type="button"
          variant="outline"
          onClick={() => soon("GitHub")}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <GithubIcon /> GitHub
        </MotionButton>
      </div>
      <FieldSeparator>Or continue with email</FieldSeparator>
    </>
  )
}

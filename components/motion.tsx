"use client"

import * as React from "react"
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "framer-motion"
import { Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"

/** Shared motion tokens: durations are multiples of 40ms, offsets follow the 8px grid. */
export const ease = [0.22, 1, 0.36, 1] as const
export const spring = { type: "spring", stiffness: 400, damping: 30 } as const

export function MotionProvider({ children }: { children: React.ReactNode }) {
  // Respects the user's "reduce motion" OS setting.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
}
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease } },
}

const MotionFieldGroup = motion.create(FieldGroup)
const MotionField = motion.create(Field)

/** Drop-in for <FieldGroup>: staggers its <MField> children in. */
export function MGroup(props: React.ComponentProps<typeof FieldGroup>) {
  return (
    <MotionFieldGroup
      variants={container}
      initial="hidden"
      animate="show"
      {...(props as object)}
    />
  )
}
/** Drop-in for <Field>: fades/slides in as part of an <MGroup>. */
export function MField(props: React.ComponentProps<typeof Field>) {
  return <MotionField variants={itemVariants} {...(props as object)} />
}

/** Error message that slides open/closed and nudges the eye with a small shake. */
export function AnimatedError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, height: 0, x: 0 }}
          animate={{ opacity: 1, height: "auto", x: [0, -4, 4, -2, 0] }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.24, ease }}
          className="overflow-hidden"
        >
          <FieldError>{message}</FieldError>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const MotionButton = motion.create(Button)

/** Primary submit button with hover/tap micro-interactions and a loading spinner. */
export function SubmitButton({
  loading,
  children,
}: {
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <MotionButton
      type="submit"
      size="lg"
      disabled={loading}
      className="w-full"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={spring}
    >
      <AnimatePresence initial={false}>
        {loading && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 16 }}
            exit={{ opacity: 0, width: 0 }}
            className="flex"
          >
            <Loader2Icon className="animate-spin" />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </MotionButton>
  )
}

export { motion, AnimatePresence }

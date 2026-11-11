"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ease } from "@/components/motion"
import { passwordStrength } from "@/lib/validation"

const colors = [
  "bg-muted",
  "bg-destructive",
  "bg-warning",
  "bg-info",
  "bg-success",
]

export function PasswordStrength({ value }: { value: string }) {
  const { score, label } = passwordStrength(value)
  return (
    <AnimatePresence initial={false}>
      {value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.24, ease }}
          className="flex flex-col gap-1 overflow-hidden"
          aria-live="polite"
        >
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
              >
                <motion.div
                  className={`h-full rounded-full ${colors[score]}`}
                  initial={false}
                  animate={{ width: i <= score ? "100%" : "0%" }}
                  transition={{ duration: 0.32, ease, delay: i * 0.04 }}
                />
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

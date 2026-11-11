"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PasswordInput(
  props: Omit<React.ComponentProps<"input">, "type">
) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-9" />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute top-1/2 right-1 -translate-y-1/2"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={show ? "off" : "on"}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.12 }}
            className="flex"
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </motion.span>
        </AnimatePresence>
      </Button>
    </div>
  )
}

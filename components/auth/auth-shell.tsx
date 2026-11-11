"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldCheckIcon } from "lucide-react"
import { ease, spring } from "@/components/motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-muted p-6 dark:bg-background">
      {/* Soft brand glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-brand-shy-moment/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-brand-light-greenish-blue/30 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="relative"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <motion.span
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={spring}
            className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <ShieldCheckIcon className="size-6" />
          </motion.span>
          Acme Inc.
        </Link>
      </motion.div>

      <motion.div
        key={title}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease }}
        className="relative w-full max-w-sm"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">{children}</CardContent>
        </Card>
      </motion.div>

      {footer && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="relative text-sm text-muted-foreground"
        >
          {footer}
        </motion.p>
      )}
    </main>
  )
}

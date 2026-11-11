"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSessionUser, signOut } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = React.useState<{
    name: string
    email: string
  } | null>(null)

  React.useEffect(() => {
    const u = getSessionUser()
    if (!u) router.replace("/signin")
    // localStorage is only readable on the client, so sync it after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setUser(u)
  }, [router])

  if (!user) return null

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Hello, {user.name} 👋</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                signOut()
                toast.success("Signed out")
                router.push("/signin")
              }}
            >
              Sign out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

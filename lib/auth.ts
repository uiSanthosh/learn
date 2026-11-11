// Demo-only auth backed by localStorage. Replace with a real backend / auth provider.
// Passwords are stored in plain text here purely for demonstration.
export const DEMO_CODE = "123456"

type User = { name: string; email: string; password: string; verified: boolean }

const USERS_KEY = "demo-users"
const SESSION_KEY = "demo-session"
const delay = (ms = 700) => new Promise((r) => setTimeout(r, ms))

function readUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]")
  } catch {
    return []
  }
}
const writeUsers = (u: User[]) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(u))
const norm = (e: string) => e.trim().toLowerCase()

export type Result<T = void> =
  { ok: true; data: T } | { ok: false; error: string }

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<Result> {
  await delay()
  const users = readUsers()
  if (users.some((u) => u.email === norm(email)))
    return { ok: false, error: "An account with this email already exists." }
  writeUsers([
    ...users,
    { name: name.trim(), email: norm(email), password, verified: false },
  ])
  return { ok: true, data: undefined }
}

export async function signIn(
  email: string,
  password: string
): Promise<Result<{ verified: boolean }>> {
  await delay()
  const user = readUsers().find((u) => u.email === norm(email))
  if (!user || user.password !== password)
    return { ok: false, error: "Invalid email or password." }
  if (user.verified) localStorage.setItem(SESSION_KEY, user.email)
  return { ok: true, data: { verified: user.verified } }
}

export async function requestPasswordReset(email: string): Promise<Result> {
  await delay()
  // Always succeed so we don't reveal which emails are registered.
  void email
  return { ok: true, data: undefined }
}

export async function verifyCode(
  email: string,
  code: string,
  purpose: "signup" | "reset"
): Promise<Result> {
  await delay()
  if (code !== DEMO_CODE)
    return { ok: false, error: "Incorrect code. Please try again." }
  if (purpose === "signup") {
    const users = readUsers().map((u) =>
      u.email === norm(email) ? { ...u, verified: true } : u
    )
    writeUsers(users)
    localStorage.setItem(SESSION_KEY, norm(email))
  }
  return { ok: true, data: undefined }
}

export async function resetPassword(
  email: string,
  password: string
): Promise<Result> {
  await delay()
  const users = readUsers()
  if (!users.some((u) => u.email === norm(email)))
    return { ok: false, error: "Account not found." }
  writeUsers(
    users.map((u) => (u.email === norm(email) ? { ...u, password } : u))
  )
  return { ok: true, data: undefined }
}

export function getSessionUser(): { name: string; email: string } | null {
  try {
    const email = localStorage.getItem(SESSION_KEY)
    const user = readUsers().find((u) => u.email === email)
    return user ? { name: user.name, email: user.email } : null
  } catch {
    return null
  }
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
}

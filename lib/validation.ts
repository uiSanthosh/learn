export const validateEmail = (v: string) =>
  !v.trim()
    ? "Email is required."
    : !/^\S+@\S+\.\S+$/.test(v.trim())
      ? "Enter a valid email address."
      : ""

export const validateName = (v: string) =>
  v.trim().length < 2 ? "Name must be at least 2 characters." : ""

export const validatePassword = (v: string) =>
  v.length < 8
    ? "Password must be at least 8 characters."
    : !/[A-Za-z]/.test(v) || !/\d/.test(v)
      ? "Password must include a letter and a number."
      : ""

export function passwordStrength(v: string): { score: number; label: string } {
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/\d/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return { score: s, label: ["Too weak", "Weak", "Fair", "Good", "Strong"][s] }
}

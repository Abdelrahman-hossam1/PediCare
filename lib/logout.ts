// Client-side logout helper (clears httpOnly cookie via the logout API route)
export async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })
}
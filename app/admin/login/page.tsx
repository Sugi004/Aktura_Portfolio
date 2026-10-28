import { signIn } from "../actions";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main id="main-content" className="admin-shell admin-login"><p className="admin-kicker">Private workspace</p><h1>Sign in</h1><p>Use the Supabase account authorized for this dashboard.</p>
    {error && <p role="alert">{error === "credentials" ? "Those sign-in details were not accepted." : error === "unauthorized" ? "This account is not authorized for the admin workspace." : "Admin sign-in is not configured. Check the server environment."}</p>}
    <form action={signIn} className="admin-login-form"><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button type="submit">Sign in</button></form>
  </main>;
}

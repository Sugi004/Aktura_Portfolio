import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser validates the token with Supabase and refreshes expiring sessions.
  let user: User | null = null;
  try {
    const auth = await supabase.auth.getUser();
    if (auth.error && auth.error.status && auth.error.status >= 500) return serviceUnavailable(request);
    user = auth.data.user;
  } catch {
    return serviceUnavailable(request);
  }
  const pathname = request.nextUrl.pathname;
  const loginRoute = pathname === "/admin/login";

  if (!user && !loginRoute) return redirectWithCookies(request, response, "/admin/login");
  if (user && loginRoute) {
    try {
      const { data: admin, error } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
      if (error) return serviceUnavailable(request);
      if (admin) return redirectWithCookies(request, response, "/admin");
    } catch {
      return serviceUnavailable(request);
    }
    return response;
  }
  if (user && !loginRoute) {
    let admin;
    try {
      const result = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
      if (result.error) return serviceUnavailable(request);
      admin = result.data;
    } catch {
      return serviceUnavailable(request);
    }
    if (!admin) {
      if (pathname.startsWith("/api/")) return new NextResponse(JSON.stringify({ error: "Not authorized." }), { status: 403, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
      return redirectWithCookies(request, response, "/admin/login?error=unauthorized");
    }
  }

  return response;
}

function serviceUnavailable(request: NextRequest) {
  const body = request.nextUrl.pathname.startsWith("/api/")
    ? JSON.stringify({ error: "Admin authentication is temporarily unavailable." })
    : "Admin authentication is temporarily unavailable. Please try again shortly.";
  return new NextResponse(body, {
    status: 503,
    headers: { "Content-Type": request.nextUrl.pathname.startsWith("/api/") ? "application/json" : "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function redirectWithCookies(request: NextRequest, source: NextResponse, path: string) {
  const target = request.nextUrl.clone();
  target.pathname = path.split("?")[0];
  target.search = path.includes("?") ? path.slice(path.indexOf("?")) : "";
  const redirect = NextResponse.redirect(target);
  source.cookies.getAll().forEach(({ name, value, ...options }) => redirect.cookies.set(name, value, options));
  return redirect;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

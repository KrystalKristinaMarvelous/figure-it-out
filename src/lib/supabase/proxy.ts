import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth", "/api/health"];

/** Refreshes the Supabase session cookie and gate-keeps app routes. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Misconfigured env — don't 500 every route. Let the request through; the
  // page-level Supabase calls will surface a clearer error.
  if (!url || !anon) {
    console.error(
      "[proxy] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
    return response;
  }

  let user = null;
  try {
    const supabase = createServerClient<Database>(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch (e) {
    console.error("[proxy] Supabase session refresh failed:", e);
    return response;
  }

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && !isPublic) {
    const next = request.nextUrl.clone();
    next.pathname = "/login";
    next.searchParams.set("next", pathname);
    return NextResponse.redirect(next);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const next = request.nextUrl.clone();
    next.pathname = "/dashboard";
    return NextResponse.redirect(next);
  }

  return response;
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Create a response that we can modify with cookies
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set(name, value, options);
        },
        remove(name, options) {
          res.cookies.set(name, "", options);
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // No session → block everything except login
  if (!session && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Already logged in → block access to /login
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res; // IMPORTANT: return the response object with cookies
}

// Apply middleware only on these routes
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};

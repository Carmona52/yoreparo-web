import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next({
        request: { headers: req.headers },
    });

    const { pathname } = req.nextUrl;

    const publicRoutes = ["/auth/login", "/auth/callback", "/auth/oauth", "/confirm-account", "/reset-password"];
    const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

    if (pathname === "/" || isPublicRoute) {
        return res;
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        req.cookies.set(name, value)
                    );
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return res;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|splash-icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
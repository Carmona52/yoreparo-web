import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getAccessTokenFromCookies(req: NextRequest): string | null {
    const authCookie = req.cookies.getAll().find((c) =>
        c.name.endsWith("-auth-token")
    );

    if (!authCookie) return null;

    try {
        const parsed = JSON.parse(decodeURIComponent(authCookie.value));
        return Array.isArray(parsed) ? parsed[0] : parsed?.access_token ?? null;
    } catch {
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const { pathname } = req.nextUrl;

    const publicRoutes = ["/login", "/auth/callback"];
    const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

    if (pathname === "/" || isPublicRoute) {
        return res;
    }

    const accessToken = getAccessTokenFromCookies(req);

    if (!accessToken) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: { Authorization: `Bearer ${accessToken}` },
                },
            }
        );

        const { error } = await supabase.auth.getUser();

        if (error) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
    } catch {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return res;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
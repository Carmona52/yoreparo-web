import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLES_PERMITIDOS = ["owner", "supervisor", "administrador"] as const;
type RolPermitido = typeof ROLES_PERMITIDOS[number];

function rolPermitido(role: string | null | undefined): role is RolPermitido {
    return ROLES_PERMITIDOS.includes(role as RolPermitido);
}

const PUBLIC_ROUTES = [
    "/auth/login",
    "/auth/callback",
    "/auth/oauth",
    "/confirm-account",
    "/reset-password",
    "/download",
    "/unauthorized",
];

function isPublicRoute(pathname: string) {
    return pathname === "/" || PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
}

export async function middleware(req: NextRequest) {
    const res = NextResponse.next({ request: { headers: req.headers } });
    const { pathname } = req.nextUrl;

    if (isPublicRoute(pathname)) return res;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return req.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
                    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
                },
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (!rolPermitido(profile.role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return res;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|splash-icon\\.png|logo\\.png|IconTrabajador\\.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
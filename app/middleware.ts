import {createServerClient} from "@supabase/ssr";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

const ROLES_DASHBOARD = ["owner", "supervisor", "administrador"] as const;
const ROLE_HOME = ["cliente"] as const;
type RolHome = typeof ROLE_HOME[number];
type RolDashboard = typeof ROLES_DASHBOARD[number];

function isHomeRole(role: string | null | undefined): role is RolHome {
    return ROLE_HOME.includes(role as RolHome);

}

function isDashboardRole(role: string | null | undefined): role is RolDashboard {
    return ROLES_DASHBOARD.includes(role as RolDashboard);
}

const FULLY_PUBLIC = [
    "/auth/login",
    "/auth/callback",
    "/auth/oauth",
    "/confirm-account",
    "/reset-password",
    "/download",
    "/unauthorized",
    "/home",
];

const AUTH_REQUIRED = [
    "/home/servicios",
    "/home/cotizaciones",
];

function isFullyPublic(pathname: string): boolean {
    if (pathname === "/") return true;
    return FULLY_PUBLIC.some((r) => {
        return pathname === r || pathname === `${r}/`;
    });
}

function isAuthRequired(pathname: string): boolean {
    return AUTH_REQUIRED.some((r) => pathname.startsWith(r));
}

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
    const res = NextResponse.next({request: {headers: req.headers}});
    const {pathname} = req.nextUrl;

    if (isFullyPublic(pathname)) return res;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value}) => req.cookies.set(name, value));
                    cookiesToSet.forEach(({name, value, options}) => res.cookies.set(name, value, options));
                },
            },
        }
    );

    const {data: {user}, error: authError} = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (isAuthRequired(pathname)) return res;

    const {data: profile, error: profileError} = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dashboard") && !isDashboardRole(profile.role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if(pathname === "/home/servicios" || pathname === "/home/cotizaciones" && !isHomeRole(profile.role)) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }


    return res;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|splash-icon\\.png|logo\\.png|IconTrabajador\\.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
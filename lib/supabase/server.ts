import {createClient as createSupabaseClient} from "@supabase/supabase-js";
import {cookies} from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    const allCookies = cookieStore.getAll();
    const authCookie = allCookies.find((c) => c.name.endsWith("-auth-token"));
    let accessToken: string | undefined;

    if (authCookie) {
        try {
            const parsed = JSON.parse(decodeURIComponent(authCookie.value));
            accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
        } catch {
        }
    }

    const client = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        accessToken
            ? {
                global: {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            }
            : undefined
    );

    return client;
}
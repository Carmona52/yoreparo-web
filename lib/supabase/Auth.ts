import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {supabase} from "@/lib/supabase/supabase";

const ROLES_PERMITIDOS = ["owner", "supervisor", "administrador"];

export async function requireAuth() {

    const {data: {user}, error: authError} = await supabase.auth.getUser();

    if (authError || !user) redirect("/auth/login");

    const {data: profile, error: profileError} = await supabase
        .from("profiles")
        .select("id, role, name, email, phone")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) redirect("/unauthorized");

    if (!ROLES_PERMITIDOS.includes(profile.role)) redirect("/unauthorized");

    return {user, profile};
}
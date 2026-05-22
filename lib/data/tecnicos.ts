import { createClient } from "@/lib/supabase/client";
import { User } from "@/lib/types/user";
import { Servicios } from "@/lib/types/servicios";

export const tecnicosService = {
    async getTecnicos(): Promise<User[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .neq("role", "cliente");
        if (error) throw error;
        return data as User[];
    },

    async getSupervisores(): Promise<User[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "owner");
        if (error) throw error;
        return data as User[];
    },

    async getDetailsTecnico(id: string): Promise<User> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data as User;
    },

    async getJobsByTecnico(workerId: string): Promise<Servicios[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("worker_id", workerId)
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data as Servicios[];
    },
};
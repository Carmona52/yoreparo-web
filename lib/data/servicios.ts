import { createClient } from "@/lib/supabase/client";
import { Servicios } from "@/lib/types/servicios";

export type JobEstado = "Pendiente" | "En proceso" | "Finalizado";

export const serviciosService = {
    async getAllServicios(): Promise<Servicios[]> {
        const supabase = createClient();
        const { data, error } = await supabase.from("jobs").select("*");
        if (error) throw error;
        return data as Servicios[];
    },

    async getNumberServicios(): Promise<number | null> {
        const supabase = createClient();
        const { count, error } = await supabase
            .from("jobs")
            .select("*", { count: "exact", head: true });
        if (error) { console.error(error); return null; }
        return count;
    },
    async getNumberServiciosByWorker(id:string): Promise<number | null> {
        const supabase = createClient();
        const { count, error } = await supabase
            .from("jobs")
            .eq('id', id)
            .select("*", { count: "exact", head: true });
        if (error) { console.error(error); return null; }
        return count;
    },

    async getDetailsServicio(id: string): Promise<Servicios> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data as Servicios;
    },

    async updateEstado(id: string, estado: JobEstado): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from("jobs")
            .update({ status: estado })
            .eq("id", id);
        if (error) throw error;
    },

    async notificarTecnico(
        workerId: string,
        jobTitle: string,
        nuevoEstado: JobEstado
    ): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.functions.invoke("send-notification", {
            body: {
                user_id: workerId,
                title: "Estado del trabajo actualizado",
                body: `El trabajo "${jobTitle}" ha cambiado a: ${nuevoEstado}`,
                data: "jobs",
            },
        });
        if (error) console.warn("No se pudo enviar la notificación:", error);
    },
};
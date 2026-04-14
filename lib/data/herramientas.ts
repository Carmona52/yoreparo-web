import {createClient} from "@/lib/supabase/client";
import {Herramienta, HerramientaEstado} from "@/lib/types/herramienta";

export const herramientasService = {
    async getByTecnico(workerId: string): Promise<Herramienta[]> {
        const supabase = createClient();
        const {data, error} = await supabase
            .from("herramientas")
            .select("*")
            .eq("worker_id", workerId)
            .order("created_at", {ascending: false});
        if (error) throw error;
        return data as Herramienta[];
    },

    async actualizarEstado(id: string, estado: HerramientaEstado): Promise<void> {
        const supabase = createClient();
        const {error} = await supabase
            .from("herramientas")
            .update({estado})
            .eq("id", id);
        if (error) throw error;
    },

    async prestarHerramienta(workerId: string, tool: string): Promise<Herramienta> {
        const supabase = createClient();
        const {data, error} = await supabase
            .from("herramientas")
            .insert({tool, estado: "Prestada", worker_id: workerId})
            .select()
            .single();
        if (error) throw error;
        return data as Herramienta;
    },

    async eliminar(id: string): Promise<void> {
        const supabase = createClient();
        const {error} = await supabase
            .from("herramientas")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },
};
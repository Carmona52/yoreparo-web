import {Herramienta, HerramientaEstado, createHerramienta} from "@/lib/types/herramienta";
import {supabase} from "@/lib/supabase/supabase";

export const herramientasService = {
    async getByTecnico(workerId: string): Promise<Herramienta[]> {

        const {data, error} = await supabase
            .from("herramientas")
            .select("*")
            .eq("worker_id", workerId)
            .order("created_at", {ascending: false});
        if (error) throw error;
        return data as Herramienta[];
    },

    async actualizarEstado(id: string, estado: HerramientaEstado): Promise<void> {
        const {error} = await supabase
            .from("herramientas")
            .update({estado})
            .eq("id", id);
        if (error) throw error;
    },

    async prestarHerramienta(herramientaId: string, workerId: string): Promise<Herramienta> {
        const { data, error } = await supabase
            .from("herramientas")
            .update({
                worker_id: workerId,
                estado: "Prestada",
                fecha_prestamo: new Date().toISOString()
            })
            .eq("id", herramientaId)
            .select()
            .single();

        if (error) throw error;
        return data as Herramienta;
    },

    async devolverHerramienta(id: string): Promise<void> {
        const {error} = await supabase
            .from("herramientas")
            .update({
                estado: "En inventario",
                worker_id: null,
                fecha_prestamo: null
            })
            .eq("id", id);
        if (error) throw error;
    },

    async eliminar(id: string): Promise<void> {
        const {error} = await supabase
            .from("herramientas")
            .delete()
            .eq("id", id);
        if (error) throw error;
    },

    async getAllHerramientas(): Promise<Herramienta[]> {
        const {data, error} = await supabase
            .from("herramientas")
            .select("*,  trabajador:profiles!worker_id(name)")

        if (error) throw error;
        return data as Herramienta[];
    },

    async insertNewHerramienta(props: createHerramienta) {
        const {data, error} = await supabase
            .from("herramientas")
            .insert(props)
        if (error) throw error;
        return data;
    }
};
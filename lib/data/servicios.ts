import {createClient} from "@/lib/supabase/client";
import {Servicios} from "@/lib/types/servicios";

export const serviciosService = {
    async getAllServicios(): Promise<Servicios[]> {
        const supabase = createClient();
        const {data, error} = await supabase.from("jobs").select("*");

        if (error) throw error;

        return data as Servicios[];
    },

    async getNumberServicios() {
        const supabase = createClient();
        const {count, error} = await supabase
            .from("jobs")
            .select("*", {count: "exact", head: true});

        if (error) {
            console.error("Error al contar registros:", error);
            return null;
        }

        return count;
    },

    async getDetailsServicio(id: string): Promise<Servicios> {
        const supabase = createClient();
        const {data, error} = await supabase.from("jobs").select("*").eq('id', id).single();

        if (error) throw error;

        return data as Servicios;
    }
};
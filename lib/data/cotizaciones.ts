import { createClient } from "@/lib/supabase/client";
import { Cotizaciones } from "@/lib/types/cotizaciones";

export const cotizacionesService = {
    async getAllCotizaciones(): Promise<Cotizaciones[]> {
        const supabase = createClient();
        const { data, error } = await supabase.from("cotizaciones").select("*");
        if (error) throw error;
        return data as Cotizaciones[];
    },

    async getCotizacionById(id: string): Promise<Cotizaciones> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("cotizaciones")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data as Cotizaciones;
    },

    async enviarPresupuesto(id: string, costoEstimado: string, pdfUrl: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from("cotizaciones")
            .update({
                estado: "Enviada",
                costo_estimado: costoEstimado,
                pdf_url: pdfUrl,
            })
            .eq("id", id);
        if (error) throw error;
    },

    async uploadPdf(file: File, cotizacionId: string): Promise<string> {
        const supabase = createClient();
        const fileName = `presupuesto_${cotizacionId}_${Date.now()}.pdf`;

        const { error } = await supabase.storage
            .from("pdfs")
            .upload(fileName, file, { contentType: "application/pdf", upsert: true });

        if (error) throw error;

        const { data } = supabase.storage.from("pdfs").getPublicUrl(fileName);
        return data.publicUrl;
    },
};
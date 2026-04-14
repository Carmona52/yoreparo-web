export type HerramientaEstado = "Prestada" | "Dañada" | "Perdida";

export type Herramienta = {
    id: string;
    created_at: string;
    tool: string;
    estado: HerramientaEstado;
    worker_id: string;
};
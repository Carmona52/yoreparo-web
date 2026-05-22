export type HerramientaEstado = "Prestada" | "Dañada" | "Perdida" | "En inventario";

export type Herramienta = {
    id: string;
    created_at: string;
    tool: string;
    estado: HerramientaEstado;
    worker_id: string;
    trabajador?:{
        name: string;
    }
    fecha_prestamo: string;
};

export type createHerramienta = {
    tool: string;
    estado: HerramientaEstado;
    fecha_prestamo: string;
}
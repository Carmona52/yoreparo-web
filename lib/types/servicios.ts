export type Servicios = {
    id: string,
    title: string,
    description: string,
    address: string,
    latitude: number,
    longitude: number,
    worker_id: string,
    created_by: string,
    status: string,
    created_at: string,
    fecha_cita: string,
    image_url: string,
    cotizacion_id: string,
    price: number,
    name_client?: string,
    profiles?: {
        name: string;
    }
    trabajador?: {
        name: string
    }
}
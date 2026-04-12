export type User = {
    id:string;
    role:string;
    name: string;
    phone: string;
    created_at: string;
    email: string;
    updated_at: string;
    data?:{
        name: string;
        email: string;
        phone: string;
    }
}
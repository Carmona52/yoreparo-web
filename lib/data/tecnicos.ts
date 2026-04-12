import {createClient} from "@/lib/supabase/client";
import {User} from "@/lib/types/user";

export const tecnicosService = {
    async getTecnicos():Promise<User[]> {
        const supabase = createClient()
        const {data, error} = await supabase.from('profiles').select('*').neq('role', 'cliente');

        if (error) throw error;

        return data as User[];
    }
}
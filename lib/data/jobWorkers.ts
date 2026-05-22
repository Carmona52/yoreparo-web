import {createClient} from "@/lib/supabase/client";
import {User} from "@/lib/types/user";
import {supabase} from "@/lib/supabase/supabase";
export const jobWorkersService = {

    async getByJob(jobId: string): Promise<User[]> {
        const supabase = createClient();
        const {data, error} = await supabase
            .from("job_workers")
            .select("profiles(*)")
            .eq("job_id", jobId);
        if (error) throw error;
        return (data ?? []).map((row: { profiles: unknown }) => row.profiles as User);
    },

    async insertMany(jobId: string, workerIds: string[]): Promise<void> {
        if (workerIds.length === 0) return;
        const supabase = createClient();
        const rows = workerIds.map((worker_id) => ({job_id: jobId, worker_id}));
        const {error} = await supabase.from("job_workers").upsert(rows, {onConflict: "job_id,worker_id"});
        if (error) throw error;
    },

    async remove(jobId: string, workerId: string): Promise<void> {
        const {error} = await supabase
            .from("job_workers")
            .delete()
            .eq("job_id", jobId)
            .eq("worker_id", workerId);
        if (error) throw error;
    },

    async sync(jobId: string, workerIds: string[]): Promise<void> {
        await supabase.from("job_workers").delete().eq("job_id", jobId);
        if (workerIds.length > 0) {
            const rows = workerIds.map((worker_id) => ({job_id: jobId, worker_id}));
            const {error} = await supabase.from("job_workers").insert(rows);
            if (error) throw error;
        }
    },

    async notificarTodos(
        jobId: string,
        jobTitle: string,
        mensaje: string
    ): Promise<void> {
        const trabajadores = await jobWorkersService.getByJob(jobId);
        await Promise.allSettled(
            trabajadores.map((t) =>
                supabase.functions.invoke("send-notification", {
                    body: {
                        user_id: t.id,
                        title: "Actualización de trabajo",
                        body: mensaje,
                        data: "jobs",
                    },
                })
            )
        );
    },
};
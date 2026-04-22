"use client";

import {useState, useMemo} from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import {Servicios} from "@/lib/types/servicios";

type Periodo = "semanal" | "quincenal" | "mensual";

function formatMXN(val: number) {
    return `$${val.toLocaleString("es-MX")}`;
}

function startOfDay(d: Date) {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
}

function buildDataSemanal(jobs: Servicios[]) {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const ahora = new Date();
    const inicioSemana = startOfDay(new Date(ahora));
    inicioSemana.setDate(ahora.getDate() - ahora.getDay());

    const map: Record<number, number> = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};

    jobs.forEach((j) => {
        if (!j.fecha_cita || !j.price) return;
        const d = new Date(j.fecha_cita);
        if (d >= inicioSemana && d <= ahora) {
            map[d.getDay()] = (map[d.getDay()] ?? 0) + Number(j.price);
        }
    });

    return dias.map((label, i) => ({label, total: map[i] ?? 0}));
}

function buildDataQuincenal(jobs: Servicios[]) {
    const ahora = new Date();
    const data: { label: string; total: number }[] = [];

    for (let i = 14; i >= 0; i--) {
        const d = startOfDay(new Date(ahora));
        d.setDate(ahora.getDate() - i);
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        const total = jobs
            .filter((j) => {
                if (!j.fecha_cita || !j.price) return false;
                const jd = startOfDay(new Date(j.fecha_cita));
                return jd.getTime() === d.getTime();
            })
            .reduce((acc, j) => acc + Number(j.price), 0);
        data.push({label, total});
    }
    return data;
}

function buildDataMensual(jobs: Servicios[]) {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const ahora = new Date();
    const data: { label: string; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const mes = d.getMonth();
        const anio = d.getFullYear();
        const total = jobs
            .filter((j) => {
                if (!j.fecha_cita || !j.price) return false;
                const jd = new Date(j.fecha_cita);
                return jd.getMonth() === mes && jd.getFullYear() === anio;
            })
            .reduce((acc, j) => acc + Number(j.price), 0);
        data.push({label: `${meses[mes]} ${anio !== ahora.getFullYear() ? anio : ""}`.trim(), total});
    }
    return data;
}


function CustomTooltip({active, payload, label}: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <Box sx={{bgcolor: "#1A1A2E", borderRadius: 2, px: 2, py: 1.5, boxShadow: "0 4px 20px rgba(0,0,0,0.2)"}}>
            <Typography variant="caption" color="rgba(255,255,255,0.6)" display="block">{label}</Typography>
            <Typography variant="body2" fontWeight={800} color="#FFD600">{formatMXN(payload[0].value)}</Typography>
        </Box>
    );
}


export default function GraficaIngresos({jobs}: { jobs: Servicios[] }) {
    const [periodo, setPeriodo] = useState<Periodo>("mensual");

    const data = useMemo(() => {
        if (periodo === "semanal") return buildDataSemanal(jobs);
        if (periodo === "quincenal") return buildDataQuincenal(jobs);
        return buildDataMensual(jobs);
    }, [periodo, jobs]);

    const totalPeriodo = data.reduce((acc, d) => acc + d.total, 0);

    return (
        <Card sx={{borderRadius: 4, border: "1px solid rgba(0,0,0,0.07)"}}>
            <CardContent sx={{p: 3}}>
                <Box sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2
                }}>
                    <Box>
                        <Typography variant="body2" fontWeight={700} mb={0.5}>Ingresos</Typography>
                        <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1}>
                            {formatMXN(totalPeriodo)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total del periodo · solo trabajos finalizados
                        </Typography>
                    </Box>

                    <ToggleButtonGroup
                        value={periodo}
                        exclusive
                        onChange={(_, v) => {
                            if (v) setPeriodo(v as Periodo);
                        }}
                        size="small"
                        sx={{
                            "& .MuiToggleButton-root": {
                                fontSize: 11, fontWeight: 700, px: 1.5, py: 0.5,
                                textTransform: "none", border: "1px solid rgba(0,0,0,0.12)",
                            },
                            "& .Mui-selected": {
                                bgcolor: "#FFD600 !important",
                                color: "#1A1A2E !important",
                                borderColor: "#FFD600 !important",
                            },
                        }}
                    >
                        <ToggleButton value="semanal">Semanal</ToggleButton>
                        <ToggleButton value="quincenal">Quincenal</ToggleButton>
                        <ToggleButton value="mensual">Mensual</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Gráfica */}
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data} margin={{top: 4, right: 4, left: 0, bottom: 0}}>
                        <defs>
                            <linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FFD600" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#FFD600" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false}/>
                        <XAxis
                            dataKey="label"
                            tick={{fontSize: 11, fill: "#5A5A72"}}
                            axisLine={false} tickLine={false}
                        />
                        <YAxis
                            tick={{fontSize: 11, fill: "#5A5A72"}}
                            axisLine={false} tickLine={false}
                            tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                            width={48}
                        />
                        <Tooltip content={<CustomTooltip/>} cursor={{stroke: "rgba(0,0,0,0.08)", strokeWidth: 1}}/>
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#FFD600"
                            strokeWidth={2.5}
                            fill="url(#gradIngreso)"
                            dot={{r: 3, fill: "#FFD600", strokeWidth: 0}}
                            activeDot={{r: 5, fill: "#F57C00", strokeWidth: 0}}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
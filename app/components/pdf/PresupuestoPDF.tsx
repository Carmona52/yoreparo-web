import {
    Document, Page, Text, View, Image, StyleSheet,
} from "@react-pdf/renderer";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type MaterialRow = {
    id: string;
    descripcion: string;
    cantidad: string;
    precioUnitario: string;
};

export type ServicioBloque = {
    id: string;
    nombre: string;
    color: string;       // hex elegido por el usuario
    materiales: MaterialRow[];
};

export type DatosEmpresa = {
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
};

export type DatosCliente = {
    nombre: string;
    telefono: string;
    email: string;
};

export type PresupuestoPDFProps = {
    folio: string;
    fecha: string;
    empresa: DatosEmpresa;
    cliente: DatosCliente;
    servicios: ServicioBloque[];
    manoDeObra: string;
    tiempoEstimado: string;
    formaPago: string;
    conIva: boolean;
    logoUrl?: string;
    marcaAguaUrl?: string;
    logoYoReparo?: string;
};


function parseMonto(val: string): number {
    const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
}

function formatMXN(val: number): string {
    return `$${val.toLocaleString("es-MX", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r},${g},${b})`;
}

function textColorForBg(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.5 ? "#1A1A2E" : "#FFFFFF";
}


const C = {
    dark: "#1A1A2E",
    yellow: "#FFD600",
    gray: "#5A5A72",
    grayLight: "#F5F6FA",
    border: "#E0E0E0",
    white: "#FFFFFF",
    green: "#2E7D32",
    alexa: "#3737cb"
};

const s = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 9,
        color: C.dark,
        paddingBottom: 50,
    },

    watermark: {
        position: "absolute",
        top: "25%",
        left: "20%",
        width: 300,
        height: 500,
        opacity: 0.06,
    },

    headerBand: {
        paddingHorizontal: 36,
        paddingTop: 28,
        paddingBottom: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headerTitle: {fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: 2},
    headerSubtitle: {fontSize: 9, marginTop: 2},
    headerMeta: {fontSize: 8, marginTop: 1},
    logoBox: {
        borderRadius: 8, padding: 8,
        alignItems: "center", justifyContent: "center",
        width: 96, height: 96,
    },
    logo: {width: 128, height: 128, objectFit: "contain"},
    logoYoReparo: {width: 116, height: 116, objectFit: "contain"},
    logoFallback: {fontSize: 11, fontFamily: "Helvetica-Bold", color: C.dark},

    body: {paddingHorizontal: 36, paddingTop: 24},

    infoRow: {flexDirection: "row", gap: 16, marginBottom: 20},
    infoBox: {
        flex: 1, backgroundColor: C.grayLight,
        borderRadius: 6, padding: 12,
        borderLeft: `3px solid ${C.yellow}`,
    },
    infoTitle: {
        fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray,
        textTransform: "uppercase", letterSpacing: 1, marginBottom: 6,
    },
    infoName: {fontSize: 11, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 3},
    infoText: {fontSize: 8, color: C.gray, marginBottom: 2},

    tableHeaderRow: {
        flexDirection: "row",
        paddingVertical: 7, paddingHorizontal: 10,
        borderRadius: 4,
    },
    tableHeaderText: {
        fontSize: 8, fontFamily: "Helvetica-Bold",
        color: C.white, textTransform: "uppercase", letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 6, paddingHorizontal: 10,
        borderBottom: `0.5px solid ${C.border}`,
    },
    tableRowAlt: {backgroundColor: "rgba(0,0,0,0.03)"},

    cellDesc: {flex: 3},
    cellCant: {flex: 1, textAlign: "center"},
    cellPrecio: {flex: 1.5, textAlign: "right"},
    cellTotal: {flex: 1.5, textAlign: "right"},
    cellText: {fontSize: 8.5, color: C.dark},
    cellMuted: {fontSize: 8.5, color: C.gray},
    cellBold: {fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.dark},

    subtotalRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingVertical: 5, paddingHorizontal: 10,
        borderTop: `1px solid ${C.border}`,
    },
    subtotalLabel: {fontSize: 8, marginRight: 8},
    subtotalValue: {fontSize: 8, fontFamily: "Helvetica-Bold", color: C.dark, minWidth: 70, textAlign: "right"},

    mdoRow: {
        flexDirection: "row",
        paddingVertical: 8, paddingHorizontal: 10,
        backgroundColor: "#EEF2FF",
        borderBottom: `0.5px solid ${C.border}`,
        marginTop: 12,
    },

    totalesBox: {alignSelf: "flex-end", width: 230, marginTop: 12, marginBottom: 20},
    totalesRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingVertical: 4, paddingHorizontal: 10,
        borderBottom: `0.5px solid ${C.border}`,
    },
    totalesLabel: {fontSize: 8.5, color: C.gray},
    totalesValue: {fontSize: 8.5, color: C.dark},
    ivaRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingVertical: 4, paddingHorizontal: 10,
        backgroundColor: "rgba(46,125,50,0.08)",
        borderBottom: `0.5px solid ${C.border}`,
    },
    ivaLabel: {fontSize: 8.5, color: C.green},
    ivaValue: {fontSize: 8.5, color: C.green, fontFamily: "Helvetica-Bold"},
    totalFinalRow: {
        flexDirection: "row", justifyContent: "space-between",
        backgroundColor: C.alexa, borderRadius: 4,
        paddingVertical: 8, paddingHorizontal: 10, marginTop: 4,
    },
    totalFinalLabel: {fontSize: 10, fontFamily: "Helvetica-Bold", color: 'white'},
    totalFinalValue: {fontSize: 10, fontFamily: "Helvetica-Bold", color: 'white'},

    // Footer info
    footerInfo: {flexDirection: "row", gap: 16, marginBottom: 24},
    footerBox: {flex: 1, backgroundColor: C.grayLight, borderRadius: 6, padding: 12},
    footerTitle: {
        fontSize: 7,
        fontFamily: "Helvetica-Bold",
        color: C.gray,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 6
    },
    footerText: {fontSize: 8, color: C.dark, marginBottom: 2},

    // Footer band fijo
    footerBand: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: C.yellow,
        paddingVertical: 8, paddingHorizontal: 36,
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    },
    footerBandText: {fontSize: 7.5, color: C.dark, fontFamily: "Helvetica-Bold"},
    footerBandMuted: {fontSize: 7, color: "rgba(26,26,46,0.6)"},
});

export function PresupuestoPDF({
                                   folio, fecha, empresa, cliente,
                                   servicios, manoDeObra, tiempoEstimado, formaPago,
                                   conIva, logoUrl, marcaAguaUrl, logoYoReparo
                               }: PresupuestoPDFProps) {

    const subtotalesPorServicio = servicios.map((sv) =>
        sv.materiales.reduce((acc, m) =>
            acc + parseMonto(m.cantidad) * parseMonto(m.precioUnitario), 0)
    );
    const totalMateriales = subtotalesPorServicio.reduce((a, b) => a + b, 0);
    const mdo = parseMonto(manoDeObra);
    const subtotal = totalMateriales + mdo;
    const iva = conIva ? subtotal * 0.16 : 0;
    const total = subtotal + iva;

    return (
        <Document>
            <Page size="A4" style={s.page}>

                {marcaAguaUrl && (
                    <Image src={marcaAguaUrl} style={s.watermark} fixed/>
                )}

                <View style={s.headerBand}>
                    <View>
                        {logoYoReparo
                            ? <Image src={logoYoReparo} style={s.logoYoReparo}/>
                            : <Text style={s.logoFallback}>YO REPARO</Text>
                        }
                        <Text style={s.headerTitle}>PRESUPUESTO</Text>
                        <Text style={s.headerSubtitle}>N°: {folio}</Text>
                        <Text style={s.headerMeta}>{fecha}</Text>
                    </View>
                    <View style={s.logoBox}>
                        {logoUrl
                            ? <Image src={logoUrl} style={s.logo}/>
                            : <Text style={s.logoFallback}>YO REPARO</Text>
                        }
                    </View>
                </View>

                <View style={s.body}>

                    <View style={s.infoRow}>
                        <View style={s.infoBox}>
                            <Text style={s.infoTitle}>Empresa</Text>
                            <Text style={s.infoName}>{empresa.nombre}</Text>
                            <Text style={s.infoText}>{empresa.telefono}</Text>
                            <Text style={s.infoText}>{empresa.email}</Text>
                            <Text style={s.infoText}>{empresa.direccion}</Text>
                        </View>
                        <View style={s.infoBox}>
                            <Text style={s.infoTitle}>Cliente</Text>
                            <Text style={s.infoName}>{cliente.nombre}</Text>
                            <Text style={s.infoText}>{cliente.telefono}</Text>
                            <Text style={s.infoText}>{cliente.email}</Text>
                        </View>
                    </View>

                    {servicios.map((sv, si) => {
                        const bgColor = hexToRgb(sv.color);
                        const txtColor = textColorForBg(sv.color);
                        const subtotal = subtotalesPorServicio[si];

                        return (
                            <View key={sv.id} style={{marginBottom: 10}}>
                                <View style={[s.tableHeaderRow, {backgroundColor: bgColor}]}>
                                    <Text style={[s.tableHeaderText, {flex: 3, color: txtColor}]}>
                                        {sv.nombre}
                                    </Text>
                                    <Text style={[s.tableHeaderText, {flex: 1, textAlign: "center", color: txtColor}]}>
                                        Cant.
                                    </Text>
                                    <Text style={[s.tableHeaderText, {flex: 1.5, textAlign: "right", color: txtColor}]}>
                                        P. Unitario
                                    </Text>
                                    <Text style={[s.tableHeaderText, {flex: 1.5, textAlign: "right", color: txtColor}]}>
                                        Total
                                    </Text>
                                </View>

                                {sv.materiales.map((m, mi) => {
                                    const rowTotal = parseMonto(m.cantidad) * parseMonto(m.precioUnitario);
                                    return (
                                        <View key={m.id} style={[s.tableRow, mi % 2 !== 0 ? s.tableRowAlt : {}]}>
                                            <Text style={[s.cellText, s.cellDesc]}>{m.descripcion || "—"}</Text>
                                            <Text style={[s.cellMuted, s.cellCant]}>{m.cantidad || "0"}</Text>
                                            <Text style={[s.cellMuted, s.cellPrecio]}>{formatMXN(parseMonto(m.precioUnitario))}</Text>
                                            <Text style={[s.cellBold, s.cellTotal]}>{formatMXN(rowTotal)}</Text>
                                        </View>
                                    );
                                })}

                                {/* Subtotal del bloque */}
                                <View style={[s.subtotalRow,]}>
                                    <Text style={s.subtotalLabel}>Subtotal {sv.nombre}</Text>
                                    <Text style={s.subtotalValue}>{formatMXN(subtotal)}</Text>
                                </View>
                            </View>
                        );
                    })}

                    {/* ── Mano de obra global ── */}
                    <View style={s.mdoRow}>
                        <Text style={[s.cellBold, s.cellDesc]}>Mano de obra</Text>
                        <Text style={[s.cellMuted, s.cellCant]}>—</Text>
                        <Text style={[s.cellMuted, s.cellPrecio]}>—</Text>
                        <Text style={[s.cellBold, s.cellTotal]}>{formatMXN(mdo)}</Text>
                    </View>

                    {/* ── Totales finales ── */}
                    <View style={s.totalesBox}>
                        <View style={s.totalesRow}>
                            <Text style={s.totalesLabel}>Subtotal materiales</Text>
                            <Text style={s.totalesValue}>{formatMXN(totalMateriales)}</Text>
                        </View>
                        <View style={s.totalesRow}>
                            <Text style={s.totalesLabel}>Mano de obra</Text>
                            <Text style={s.totalesValue}>{formatMXN(mdo)}</Text>
                        </View>
                        {conIva && (
                            <View style={s.ivaRow}>
                                <Text style={s.ivaLabel}>IVA (16%)</Text>
                                <Text style={s.ivaValue}>{formatMXN(iva)}</Text>
                            </View>
                        )}
                        <View style={s.totalFinalRow}>
                            <Text style={s.totalFinalLabel}>TOTAL</Text>
                            <Text style={s.totalFinalValue}>{formatMXN(total)}</Text>
                        </View>
                    </View>

                    {/* ── Footer info ── */}
                    <View style={s.footerInfo}>
                        <View style={s.footerBox}>
                            <Text style={s.footerTitle}>Tiempo y forma de pago</Text>
                            <Text style={s.footerText}>Tiempo estimado: {tiempoEstimado || "Por definir"}</Text>
                            <Text style={s.footerText}>Forma de pago: {formaPago || "Por definir"}</Text>
                            {conIva && <Text style={s.footerText}>Precio incluye IVA (16%)</Text>}
                        </View>
                        <View style={s.footerBox}>
                            <Text style={s.footerTitle}>Información de contacto</Text>
                            <Text style={s.footerText}>{empresa.nombre}</Text>
                            <Text style={s.footerText}>{empresa.telefono}</Text>
                            <Text style={s.footerText}>{empresa.email}</Text>
                        </View>
                    </View>
                </View>

                <View style={s.footerBand} fixed>
                    <Text style={s.footerBandText}>{empresa.nombre}</Text>
                    <Text style={s.footerBandMuted}>
                        Presupuesto válido por 5 días · {empresa.email}
                    </Text>
                </View>

            </Page>
        </Document>
    );
}
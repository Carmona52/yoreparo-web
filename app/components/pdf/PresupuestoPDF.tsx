import {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";


export type MaterialRow = {
    id: string;
    descripcion: string;
    cantidad: string;
    precioUnitario: string;
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
    servicio: string;
    descripcionServicio: string;
    empresa: DatosEmpresa;
    cliente: DatosCliente;
    materiales: MaterialRow[];
    manoDeObra: string;
    tiempoEstimado: string;
    formaPago: string;
    logoUrl?: string;
};


function parseMonto(val: string): number {
    const n = parseFloat(val.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
}

function formatMXN(val: number): string {
    return val.toLocaleString("es-MX", {style: "currency", currency: "MXN"});
}

const C = {
    yellow: "#FFD600",
    yellowLight: "#FFF9CC",
    dark: "#1A1A2E",
    gray: "#5A5A72",
    grayLight: "#F5F6FA",
    border: "#E0E0E0",
    white: "#FFFFFF",
    green: "#2E7D32",
};

const s = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 9,
        color: C.dark,
        paddingTop: 0,
        paddingBottom: 40,
        paddingHorizontal: 0,
    },

    headerBand: {
        paddingHorizontal: 36,
        paddingTop: 28,
        paddingBottom: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headerLeft: {flexDirection: "column", gap: 3},
    headerTitle: {
        fontSize: 22,
        fontFamily: "Helvetica-Bold",
        letterSpacing: 2,
    },
    headerSubtitle: {fontSize: 9, color: "rgb(2,33,29)", marginTop: 2},
    headerMeta: {fontSize: 8, color: "rgb(2,33,29)", marginTop: 1},
    logoBox: {
        borderRadius: 8,
        padding: 8,
        alignItems: "center",
        justifyContent: "center",
        width: 170,
        height: 100,
    },
    logo: {width: 150, height: 80, objectFit: "contain"},
    logoFallback: {fontSize: 11, fontFamily: "Helvetica-Bold", color: C.dark},


    body: {paddingHorizontal: 36, paddingTop: 24},


    infoRow: {flexDirection: "row", gap: 16, marginBottom: 20},
    infoBox: {
        flex: 1,
        backgroundColor: C.grayLight,
        borderRadius: 6,
        padding: 12,
        borderLeft: `3px solid ${C.yellow}`,
    },
    infoTitle: {
        fontSize: 7,
        fontFamily: "Helvetica-Bold",
        color: C.gray,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 6,
    },
    infoName: {fontSize: 11, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 3},
    infoText: {fontSize: 8, color: C.gray, marginBottom: 2},

    // Servicio
    servicioBox: {
        backgroundColor: C.yellowLight,
        borderRadius: 6,
        padding: 12,
        marginBottom: 20,
        borderLeft: `3px solid ${C.yellow}`,
    },
    servicioLabel: {
        fontSize: 7, fontFamily: "Helvetica-Bold",
        color: C.gray, textTransform: "uppercase",
        letterSpacing: 1, marginBottom: 4,
    },
    servicioTitle: {fontSize: 13, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 4},
    servicioDesc: {fontSize: 8, color: C.gray, lineHeight: 1.5},


    tableHeader: {
        flexDirection: "row",
        backgroundColor: C.dark,
        borderRadius: 4,
        marginBottom: 0,
        paddingVertical: 7,
        paddingHorizontal: 10,
    },
    tableHeaderText: {
        fontSize: 8, fontFamily: "Helvetica-Bold",
        color: C.white, textTransform: "uppercase", letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderBottom: `0.5px solid ${C.border}`,
    },
    tableRowAlt: {backgroundColor: C.grayLight},
    tableRowMdo: {
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: "#EEF2FF",
        borderBottom: `0.5px solid ${C.border}`,
    },
    cellDesc: {flex: 3},
    cellCant: {flex: 1, textAlign: "center"},
    cellPrecio: {flex: 1.5, textAlign: "right"},
    cellTotal: {flex: 1.5, textAlign: "right"},
    cellText: {fontSize: 8.5, color: C.dark},
    cellMuted: {fontSize: 8.5, color: C.gray},
    cellBold: {fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.dark},


    totalesBox: {
        alignSelf: "flex-end",
        width: 220,
        marginTop: 12,
        marginBottom: 20,
    },
    totalesRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderBottom: `0.5px solid ${C.border}`,
    },
    totalesLabel: {fontSize: 8.5, color: C.gray},
    totalesValue: {fontSize: 8.5, color: C.dark},
    totalFinalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: C.dark,
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginTop: 4,
    },
    totalFinalLabel: {fontSize: 10, fontFamily: "Helvetica-Bold", color: C.yellow},
    totalFinalValue: {fontSize: 10, fontFamily: "Helvetica-Bold", color: C.yellow},


    footerInfo: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 24,
    },
    footerBox: {
        flex: 1,
        backgroundColor: C.grayLight,
        borderRadius: 6,
        padding: 12,
    },
    footerTitle: {
        fontSize: 7, fontFamily: "Helvetica-Bold",
        color: C.gray, textTransform: "uppercase",
        letterSpacing: 1, marginBottom: 6,
    },
    footerText: {fontSize: 8, color: C.dark, marginBottom: 2},


    footerBand: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: C.yellow,
        paddingVertical: 8,
        paddingHorizontal: 36,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerBandText: {fontSize: 7.5, color: C.dark, fontFamily: "Helvetica-Bold"},
    footerBandMuted: {fontSize: 7, color: "rgba(26,26,46,0.6)"},
});


export function PresupuestoPDF({
                                   folio,
                                   fecha,
                                   servicio,
                                   descripcionServicio,
                                   empresa,
                                   cliente,
                                   materiales,
                                   manoDeObra,
                                   tiempoEstimado,
                                   formaPago,
                                   logoUrl,
                               }: PresupuestoPDFProps) {
    const subtotalMat = materiales.reduce((acc, m) => {
        return acc + parseMonto(m.cantidad) * parseMonto(m.precioUnitario);
    }, 0);
    const mdo = parseMonto(manoDeObra);
    const total = subtotalMat + mdo;

    return (
        <Document>
            <Page size="A4" style={s.page}>

                <View style={s.headerBand}>
                    <View style={s.headerLeft}>
                        <Text style={s.headerTitle}>PRESUPUESTO</Text>
                        <Text style={s.headerSubtitle}>N°: {folio}</Text>
                        <Text style={s.headerMeta}>{fecha}</Text>
                        <Text style={[s.headerMeta, {marginTop: 6}]}>
                            Servicio: {servicio}
                        </Text>
                    </View>
                    <View style={s.logoBox}>
                        {logoUrl ? (
                            <Image src={logoUrl} style={s.logo}/>
                        ) : (
                            <Text style={s.logoFallback}>YO REPARO</Text>
                        )}
                    </View>
                </View>

                <View style={s.body}>

                    {/* ── Info empresa / cliente ── */}
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

                    {/* ── Servicio ── */}
                    <View style={s.servicioBox}>
                        <Text style={s.servicioLabel}>Detalle del servicio</Text>
                        <Text style={s.servicioTitle}>{servicio}</Text>
                        <Text style={s.servicioDesc}>{descripcionServicio}</Text>
                    </View>

                    {/* ── Tabla ── */}
                    {/* Header */}
                    <View style={s.tableHeader}>
                        <Text style={[s.tableHeaderText, s.cellDesc]}>Descripción</Text>
                        <Text style={[s.tableHeaderText, s.cellCant]}>Cant.</Text>
                        <Text style={[s.tableHeaderText, s.cellPrecio]}>P. Unitario</Text>
                        <Text style={[s.tableHeaderText, s.cellTotal]}>Total</Text>
                    </View>

                    {/* Filas materiales */}
                    {materiales.map((m, i) => {
                        const rowTotal = parseMonto(m.cantidad) * parseMonto(m.precioUnitario);
                        return (
                            <View key={m.id} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}>
                                <Text style={[s.cellText, s.cellDesc]}>{m.descripcion || "—"}</Text>
                                <Text style={[s.cellMuted, s.cellCant]}>{m.cantidad || "0"}</Text>
                                <Text style={[s.cellMuted, s.cellPrecio]}>
                                    {formatMXN(parseMonto(m.precioUnitario))}
                                </Text>
                                <Text style={[s.cellBold, s.cellTotal]}>{formatMXN(rowTotal)}</Text>
                            </View>
                        );
                    })}

                    {/* Fila mano de obra */}
                    <View style={s.tableRowMdo}>
                        <Text style={[s.cellBold, s.cellDesc]}>Mano de obra</Text>
                        <Text style={[s.cellMuted, s.cellCant]}>—</Text>
                        <Text style={[s.cellMuted, s.cellPrecio]}>—</Text>
                        <Text style={[s.cellBold, s.cellTotal]}>{formatMXN(mdo)}</Text>
                    </View>

                    {/* ── Totales ── */}
                    <View style={s.totalesBox}>
                        <View style={s.totalesRow}>
                            <Text style={s.totalesLabel}>Subtotal materiales</Text>
                            <Text style={s.totalesValue}>{formatMXN(subtotalMat)}</Text>
                        </View>
                        <View style={s.totalesRow}>
                            <Text style={s.totalesLabel}>Mano de obra</Text>
                            <Text style={s.totalesValue}>{formatMXN(mdo)}</Text>
                        </View>
                        <View style={s.totalFinalRow}>
                            <Text style={s.totalFinalLabel}>TOTAL</Text>
                            <Text style={s.totalFinalValue}>{formatMXN(total)}</Text>
                        </View>
                    </View>

                    {/* ── Footer info ── */}
                    <View style={s.footerInfo}>
                        <View style={s.footerBox}>
                            <Text style={s.footerTitle}>Tiempo y forma de pago</Text>
                            <Text style={s.footerText}>
                                Tiempo estimado: {tiempoEstimado || "Por definir"}
                            </Text>
                            <Text style={s.footerText}>
                                Forma de pago: {formaPago || "Por definir"}
                            </Text>
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
                        Presupuesto válido por 15 días · {empresa.email}
                    </Text>
                </View>

            </Page>
        </Document>
    );
}
import type {Metadata} from "next";


export const metadata: Metadata = {
    title: "Yo Reparo",
    description: "Bienvenido a Yo Reparo, tus reparradoaros de confianza",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <div>

            {children}

        </div>
    );
}
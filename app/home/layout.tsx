import type {Metadata} from "next";
import Navbar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
    title: "Yo Reparo",
    description: "Bienvenido a Yo Reparo, tus reparradoaros de confianza",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar/>
            {children}
            <Footer/>
        </div>
    );
}
"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import Button from "@mui/material/Button";
import logoYoReparo from "@/public/logo.png";
import yoReparoTitle from "@/public/Yoreparo1024.png";

export default function Navbar() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({behavior: "smooth"});
        }
    };

    return (
        <nav
            className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 rounded-b-xl ${
                scrolled
                    ? "bg-white/95 backdrop-blur shadow-sm border-b border-gray-100"
                    : "bg-transparent"
            }`}>
            <div className="w-[90%] mx-auto py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Image
                        src={logoYoReparo}
                        alt="YoReparo"
                        className="w-12 h-auto object-contain md:w-20"
                    />
                    <Image
                        src={yoReparoTitle}
                        alt="YoReparo"
                        className="w-24 h-auto object-contain md:w-32"
                    />
                </div>

                <div className="hidden md:flex items-center gap-8">
                    {["Servicios", "Proceso", "Nosotros"].map((button) => {
                        const id = button.toLowerCase();
                        return (
                            <Button
                                key={button}
                                onClick={() => scrollToSection(id)}
                                variant="outlined"
                                size="large"
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    fontWeight: 700,
                                }}
                            >
                                {button}
                            </Button>
                        );
                    })}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => router.push("/auth/login")}
                        sx={{borderRadius: 2, px: 3, fontWeight: 700}}
                    >
                        Iniciar sesión
                    </Button>
                </div>
            </div>
        </nav>
    );
}
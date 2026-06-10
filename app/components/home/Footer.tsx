import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-8 px-6">
            <div className="w-[90%] mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Image
                        src="/1780808089898_logo.png"
                        alt="YoReparo"
                        width={32}
                        height={32}
                        style={{ objectFit: "contain" }}
                    />
                    <span className="text-lg font-bold text-gray-900">
            Yo<span className="text-blue-600">Reparo</span>
          </span>
                </div>
                <p className="text-sm text-gray-400">
                    © 2026 YoReparo · Tehuacán, Puebla · Todos los derechos reservados
                </p>
            </div>
        </footer>
    );
}
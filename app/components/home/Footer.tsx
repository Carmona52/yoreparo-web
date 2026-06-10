import Image from "next/image";
import logoYoReparo from "@/public/logo.png";
import yoReparoTitle from "@/public/Yoreparo1024.png";
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PlaceIcon from '@mui/icons-material/Place';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 px-6">
            <div className="w-[90%] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
                <div className="flex items-center gap-3">
                    <Image src={logoYoReparo} alt="YoReparo" className="w-12 h-auto object-contain md:w-15"/>
                    <Image src={yoReparoTitle} alt="YoReparo" className="w-24 h-auto object-contain md:w-27"/>
                </div>

                <div className="flex flex-col gap-2 text-md text-gray-600">
                    <ul style={{ listStyleType:'unset' }} className='flex flex-col gap-2'>
                        <li> <a href="/servicios" className="hover:text-gray-900">Servicios</a></li>
                        <li> <a href="/nosotros" className="hover:text-gray-900">Nosotros</a></li>
                        <li> <a href="/contacto" className="hover:text-gray-900">Contacto</a></li>
                    </ul>
                </div>

                <div className="text-md text-gray-600">
                    <ul style={{ listStyleType:'unset' }} className='flex flex-col gap-2'>
                        <li><p> <PlaceIcon/> Tehuacán, Puebla</p></li>
                        <li><p> <PhoneIcon/> Tel: 238 109 8104</p></li>
                        <li><p> <EmailIcon/> Email: yoreparoteh2@gmail.com</p></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-100 py-4">
                <p className="text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} YoReparo · Todos los derechos reservados
                </p>
            </div>
        </footer>
    );
}

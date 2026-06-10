'use client'
import Image from "next/image";
import {Button} from "@mui/material";

import {useRouter} from "next/navigation";

export default function NotFound() {
    const router = useRouter();
    return <div className="flex flex-col items-center justify-center align-center">
        <Image src='/error404.svg' alt='Imagen de error 404' width={400} height={400}/>
        <h1 className="text-2xl font-bold mt-4">Lo sentimos</h1>
        <p className="text-gray-600 mt-2">La página que buscas no existe.</p>
        <Button variant='contained' sx={{mt: 2}} onClick={() => router.push('/')}>Regresar al
            Inicio</Button>
    </div>
}
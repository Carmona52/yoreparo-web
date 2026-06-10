export function translateRole(role: string) {
    switch (role) {
        case "admin":
            return "Administrator";
        case "user":
            return "user";
        case "owner":
            return "Dueño"
        case "worker" :
            return "Trabajador";
    }
}
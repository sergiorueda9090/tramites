
//export const URL  = 'https://backend.movilidad2a.com';
//export const URLws = 'backend.movilidad2a.com';

//export const URL = 'http://127.0.0.1:8000';
//export const URLws = '127.0.0.1:8000';

export const URL = 'https://tramitesbackend.movilidad2a.com'; //'http://127.0.0.1:8000';
export const URLws = 'tramitesbackend.movilidad2a.com';//'127.0.0.1:8000';

export const TOKEN = (() => {
    const token = localStorage.getItem("access"); // Obtener el valor almacenado

    // Validar que el token no sea null, vacío o undefined
    if (token && token !== 'null' && token !== 'undefined') {
        return JSON.parse(token); // Convertir el valor de string a JSON
    }

    // Si no es válido, retorna null o maneja el caso según lo necesario
    return null;
})();
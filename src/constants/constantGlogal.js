import { API_BASE_URL } from '../utils/constants';

// Alias retrocompatibles — la URL real se define en .env (REACT_APP_API_URL)
export const URL = API_BASE_URL;
export const URLws = API_BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');

export const TOKEN = (() => {
    const token = localStorage.getItem("access"); // Obtener el valor almacenado

    // Validar que el token no sea null, vacío o undefined
    if (token && token !== 'null' && token !== 'undefined') {
        return JSON.parse(token); // Convertir el valor de string a JSON
    }

    // Si no es válido, retorna null o maneja el caso según lo necesario
    return null;
})();
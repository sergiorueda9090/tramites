import axios from "axios";
import { setAuthenticated, loginFail } from "./authStore.js";
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import AlertService from '../../services/alertService';
import { URL } from "../../constants/constantGlogal";


export const getAuth = (email, password) => {

    return async (dispatch, getState) => {

        // Iniciar la carga
        dispatch(showBackdrop('Iniciando sesion...'));

        const options = {
            method: 'POST',
            url:    `${URL}/api/token/`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                email   : email,
                password: password
            }
        };

        try {
            console.log('=== AUTH DEBUG ===');
            console.log('1. Iniciando login...');
            console.log('URL auth:', `${URL}/api/token/`);
            console.log('Data enviada:', { email, password: '***' });

            // Hacer la solicitud de token
            const response = await axios.request(options);
            console.log('2. Respuesta login:', response.status, response.data);

            if (response.status === 200) {

                let data = response.data;
                console.log('3. Token obtenido:', data.access ? 'SI' : 'NO');

                // Obtener la informacion del usuario autenticado
                console.log('4. Obteniendo datos del usuario...');
                console.log('URL user:', `${URL}/api/user/me/`);

                const userResponse = await axios.get(`${URL}/api/user/me/`, {
                    headers: {
                        Authorization: `Bearer ${data.access}`
                    }
                });

                console.log('5. Respuesta user:', userResponse.status, userResponse.data);
                const userData = userResponse.data;

                // Construir nombre completo
                const fullName = [userData.first_name, userData.last_name]
                    .filter(Boolean)
                    .join(' ') || userData.username;

                console.log('6. Guardando en store:', {
                    id_user: userData.id,
                    name_user: fullName,
                    email: userData.email,
                });

                dispatch(setAuthenticated({
                    "access"    : data.access,
                    "islogin"   : true,
                    "idrol"     : userData.role || 'user',
                    "id_user"   : userData.id,
                    "name_user" : fullName,
                    "email"     : userData.email,
                    "avatar"    : userData.avatar || null,
                }));

                console.log('7. Login completado!');
                dispatch(hideBackdrop());

                // Mostrar mensaje de exito
                AlertService.success('Bienvenido', `Hola ${fullName}!`);

            } else {
                console.log('ERROR: Status no es 200:', response.status);
                dispatch(hideBackdrop());
                AlertService.error('Error', 'No se pudo iniciar sesion');
            }

        } catch (error) {
            console.log('=== AUTH ERROR ===');
            console.log('Error:', error);
            console.log('Response:', error.response);

            // Manejar errores
            dispatch(hideBackdrop());

            const errorMessage = error.response?.data?.detail || error.message || 'Error de autenticacion';
            AlertService.error('Error de autenticacion', errorMessage);
        }
    };
};

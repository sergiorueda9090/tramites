import axios from "axios";
import { setAuthenticated, loginFail } from "./authStore.js";
import { showBackDropStore, hideBackDropStore, setAlert } from "../globalStore/globalStore.js";
import { URL, TOKEN } from "../../constants/constantGlogal";


export const getAuth = (email,password) => {

    return async (dispatch, getState) => {
       
        // Iniciar la carga
        await dispatch(showBackDropStore());

        const options = {
            method: 'POST',
            url:    `${URL}/auth/`,
            headers: {
                'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001',
            },
            data: {
                email:      email,
                password:   password
            }
        };

        try {
            // Hacer la solicitud
            const response = await axios.request(options);
            if(response.status === 200){

                let data = response.data;

                // Obtener la información del usuario autenticado
                const userResponse = await axios.get(`${URL}/users/api/user/`, {
                    headers: {
                        Authorization: `Bearer ${data.access}`
                    }
                });

                const userData = userResponse.data;

                await dispatch(setAuthenticated({"access":data.access, "islogin":true, "idrol":userData.idrol}));
                
                await dispatch(hideBackDropStore());

            }else{

    
                 await dispatch(setAlert({ message: "¡❌ Acción completada con éxito!", type: "error" }));

            }

       
            await dispatch(hideBackDropStore());
            // Despachar la acción setAuthenticated con la respuesta de la solicitud
        } catch (error) {
            // Manejar errores
            await dispatch(hideBackDropStore());
            await dispatch(setAlert({ message: `❌ ${error.response.data.detail}.`, type: "error" }));

        }
    };
};



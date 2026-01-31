import { createSlice } from '@reduxjs/toolkit'

const savedInfoUser = JSON.parse(localStorage.getItem("infoUser")) || {};

export const authStore = createSlice({
  name: 'authStore',
  initialState: {
    infoUser  : {},
    isLogin   : savedInfoUser.isLogin === true ? true : false,
    token     : savedInfoUser.access || '',
    idrol     : savedInfoUser.idrol || '',
    id_user   : savedInfoUser.id_user || null,
    name_user : savedInfoUser.name_user || '',
    email     : savedInfoUser.email || '',
    avatar    : savedInfoUser.avatar || null,
  },
  reducers: {
    loginSuccess:(state,action) => {
        state.isLogin   = action.payload.islogin === false ? false : true
        state.token     = action.payload.token
        state.name_user = action.payload.name_user
        state.email     = action.payload.email
        state.id_user   = action.payload.id_user
        state.avatar    = action.payload.avatar
      },
      loginFail:(state,action) => {
        // Limpiar TODO el localStorage cuando expire el token
        localStorage.clear();

        // Resetear el estado de autenticación
        state.infoUser  = {};
        state.isLogin   = false;
        state.token     = "";
        state.name_user = "";
        state.email     = "";
        state.idrol     = "";
        state.id_user   = null;
        state.avatar    = null;
      },
      setAuthenticated:(state, action) => {
          state.token     = action.payload.access;
          state.isLogin   = action.payload.islogin === true ? true : false;
          state.idrol     = action.payload.idrol;
          state.id_user   = action.payload.id_user;
          state.name_user = action.payload.name_user;
          state.email     = action.payload.email;
          state.avatar    = action.payload.avatar;

          let local = {
            "access"    : action.payload.access,
            "isLogin"   : action.payload.islogin,
            "idrol"     : action.payload.idrol,
            "id_user"   : action.payload.id_user,
            "name_user" : action.payload.name_user,
            "email"     : action.payload.email,
            "avatar"    : action.payload.avatar,
          };

          localStorage.setItem("infoUser", JSON.stringify(local));
      }
  }
})

// Action creators are generated for each case reducer function
export const { setAuthenticated, loginSuccess,  loginFail } = authStore.actions;
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import websocketService from '../services/websocketService';
import {
  setConnected,
  setUsersList,
  addUser,
  removeUser,
  setConnectionError,
  clearPresence,
  selectConnectedUsers,
  selectIsConnected,
} from '../store/presenceStore/presenceStore';

// Colores para asignar aleatoriamente a usuarios
const USER_COLORS = [
  '#e91e63',
  '#2196f3',
  '#4caf50',
  '#ff9800',
  '#9c27b0',
  '#00bcd4',
  '#ff5722',
  '#607d8b',
  '#3f51b5',
  '#009688',
];

/**
 * Genera un color basado en el ID del usuario para consistencia
 * @param {string|number} userId
 * @returns {string} Color hex
 */
const getUserColor = (userId) => {
  const hash = String(userId)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return USER_COLORS[hash % USER_COLORS.length];
};

/**
 * Hook para manejar la presencia de usuarios en tiempo real
 * @returns {Object} { connectedUsers, isConnected, connect, disconnect }
 */
export const usePresence = () => {
  console.log('=== usePresence HOOK INICIADO ===');

  const dispatch = useDispatch();
  const connectedUsers = useSelector(selectConnectedUsers);
  const isConnected = useSelector(selectIsConnected);
  const user = useSelector((state) => state.authStore);

  console.log('usePresence - user:', user);
  console.log('usePresence - connectedUsers:', connectedUsers);
  console.log('usePresence - isConnected:', isConnected);

  /**
   * Maneja los mensajes recibidos del WebSocket
   */
  const handleMessage = useCallback(
    (data) => {
      console.log('=== usePresence handleMessage ===');
      console.log('Tipo:', data.type);
      console.log('Data completa:', data);
      console.log('================================');

      switch (data.type) {
        case 'users_list':
          console.log('Actualizando lista de usuarios:', data.users);
          dispatch(setUsersList(data.users));
          break;

        case 'user_connected':
          console.log('Nuevo usuario conectado:', data.user);
          dispatch(addUser(data.user));
          break;

        case 'user_disconnected':
          console.log('Usuario desconectado:', data.user_id);
          dispatch(removeUser(data.user_id));
          break;

        case 'connection_status':
          console.log('Estado de conexion:', data.connected);
          dispatch(setConnected(data.connected));
          break;

        case 'reconnect_failed':
          console.log('Reconexion fallida');
          dispatch(setConnectionError('No se pudo reconectar al servidor'));
          break;

        case 'pong':
          console.log('Pong recibido');
          break;

        default:
          console.log('Tipo de mensaje no manejado:', data.type);
          break;
      }
    },
    [dispatch]
  );

  /**
   * Conecta al WebSocket
   */
  const connect = useCallback(() => {
    console.log('=== usePresence DEBUG ===');
    console.log('User from store:', user);
    console.log('User id_user:', user?.id_user);
    console.log('User name_user:', user?.name_user);
    console.log('User avatar:', user?.avatar);
    console.log('=========================');

    if (user?.id_user) {
      // Priorizar: avatar del store > imagen de perfil local > null
      const userAvatar = user.avatar || localStorage.getItem('userProfileImage') || null;

      const userData = {
        id: user.id_user,
        name: user.name_user || 'Usuario',
        avatar: userAvatar,
        color: getUserColor(user.id_user),
      };

      console.log('Conectando WebSocket con userData:', userData);
      websocketService.connect(userData);
    } else {
      console.log('No hay id_user, no se conecta el WebSocket');
    }
  }, [user?.id_user, user?.name_user, user?.avatar]);

  /**
   * Desconecta del WebSocket
   */
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    dispatch(clearPresence());
  }, [dispatch]);

  // Efecto para conectar/desconectar automaticamente
  useEffect(() => {
    console.log('=== usePresence useEffect ===');
    console.log('user?.id_user:', user?.id_user);

    if (user?.id_user) {
      console.log('Tiene id_user, conectando...');
      // Suscribirse a mensajes
      const unsubscribe = websocketService.subscribe(handleMessage);

      // Conectar
      connect();

      // Cleanup al desmontar o cambiar de usuario
      return () => {
        console.log('usePresence cleanup - desconectando');
        unsubscribe();
        websocketService.disconnect();
        dispatch(clearPresence());
      };
    } else {
      console.log('NO tiene id_user, no se conecta');
    }
  }, [user?.id_user, connect, handleMessage, dispatch]);

  return {
    connectedUsers,
    isConnected,
    connect,
    disconnect,
    onlineCount: connectedUsers.length,
  };
};

export default usePresence;

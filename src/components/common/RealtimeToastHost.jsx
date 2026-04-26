import React, { useEffect, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertTitle, Stack } from '@mui/material';
import notificationService from '../../services/notificationService';

const MAX_VISIBLE = 3;

/**
 * Host de toasts/snackbars para notificaciones de tiempo real.
 * Se monta UNA SOLA VEZ en el layout (ej: dentro de MainLayout) y escucha
 * a `notificationService`. No tiene logica de negocio: solo renderiza.
 */
const RealtimeToastHost = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setToasts((prev) => {
        // Limitar a MAX_VISIBLE: si llega un nuevo y ya hay 3, quitar el mas antiguo.
        const next = [...prev, notification];
        if (next.length > MAX_VISIBLE) next.shift();
        return next;
      });
    });
    return unsubscribe;
  }, []);

  const handleClose = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ top: { xs: 80, sm: 80 } }}
    >
      <Stack spacing={1} sx={{ width: '100%' }}>
        {toasts.map((t) => (
          <Alert
            key={t.id}
            severity={t.severity || 'info'}
            variant="filled"
            onClose={() => handleClose(t.id)}
            sx={{ minWidth: 320, boxShadow: 4 }}
          >
            {t.title && <AlertTitle>{t.title}</AlertTitle>}
            {t.message}
            <AutoCloseTimer duration={t.duration} onTimeout={() => handleClose(t.id)} />
          </Alert>
        ))}
      </Stack>
    </Snackbar>
  );
};

// Subcomponente que solo maneja el setTimeout de autocierre por toast
const AutoCloseTimer = ({ duration, onTimeout }) => {
  useEffect(() => {
    if (!duration) return undefined;
    const t = setTimeout(onTimeout, duration);
    return () => clearTimeout(t);
  }, [duration, onTimeout]);
  return null;
};

export default RealtimeToastHost;

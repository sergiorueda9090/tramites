import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Tooltip, Typography } from '@mui/material';

/**
 * Helpers para colores por usuario.
 *
 * - Si el backend asigno un color al usuario, se respeta.
 * - Si no, se genera deterministicamente a partir del userId para que cada
 *   usuario tenga siempre el mismo color en cualquier celda.
 */
const FALLBACK_COLORS = [
  '#e91e63', '#2196f3', '#4caf50', '#ff9800', '#9c27b0',
  '#00bcd4', '#ff5722', '#607d8b', '#3f51b5', '#009688',
];

const colorForUser = (occupant) => {
  if (occupant.user?.color) return occupant.user.color;
  const hash = String(occupant.userId)
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};

const initialsFromName = (name) => {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
};

/**
 * Pinta un overlay sobre una celda cuando otro usuario la tiene enfocada.
 * Estilo: borde de color + chip flotante con iniciales en la esquina superior derecha.
 *
 * Props:
 *   - getOccupant: selector creado por useCellPresence(viewId).getOccupant
 *   - rowId, column: identificadores de la celda
 *   - children: contenido normal de la celda (opcional)
 *
 * El componente envuelve a `children` y renderiza el overlay solo cuando hay ocupante.
 */
// Convierte un color hex en una version translucida para el bg de la celda
const hexToRgba = (hex, alpha = 0.18) => {
  const m = /^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex);
  if (!m) return `rgba(25,118,210,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
};

const CellPresenceOverlay = ({ getOccupant, rowId, column, children, sx }) => {
  const occupant = useSelector(getOccupant(rowId, column));
  const currentUserId = useSelector((state) => state.authStore?.id_user);

  if (!occupant) {
    // Sin ocupante: solo renderizamos el contenido para no impactar layout
    return <>{children}</>;
  }

  const isMe = currentUserId != null && String(occupant.userId) === String(currentUserId);
  const color = colorForUser(occupant);
  const name = occupant.user?.name || 'Usuario';
  const badgeText = isMe ? 'Tú' : initialsFromName(name);
  const tooltipText = isMe ? 'Estás aquí' : `${name} esta aqui`;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'block',
        width: '100%',
        boxShadow: `inset 0 0 0 2px ${color}`,
        backgroundColor: hexToRgba(color, 0.18),
        borderRadius: 1,
        px: 0.5,
        py: 0.25,
        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
        ...sx,
      }}
    >
      {children}
      <Tooltip title={tooltipText} arrow placement="top">
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -4,
            bgcolor: color,
            color: '#fff',
            borderRadius: '10px',
            px: 0.75,
            py: 0.15,
            fontSize: '0.65rem',
            fontWeight: 700,
            lineHeight: 1.4,
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 5,
            border: '1px solid #fff',
          }}
          data-testid="cell-presence-badge"
        >
          <Typography component="span" variant="caption" sx={{ color: 'inherit', fontWeight: 700 }}>
            {badgeText}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default CellPresenceOverlay;

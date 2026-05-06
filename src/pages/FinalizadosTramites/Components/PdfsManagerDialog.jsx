import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  Tooltip,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  selectPdfsManager,
  selectPdfsHasChanges,
  closePdfsManager,
  addNewFile,
  removeNewFile,
  updateNewFile,
  markPdfForDelete,
  unmarkPdfForDelete,
  setPendingMeta,
} from '../../../store/finalizadosTamitesStore/finalizadosTamitesStore';
import {
  loadPdfsThunk,
  commitPdfsChangesThunk,
  downloadPdfThunk,
  fetchPdfBlobUrlThunk,
  cachePdfFile,
  getCachedPdfFile,
  clearPdfFileCache,
} from '../../../store/finalizadosTamitesStore/finalizadosTamitesThunks';
import AlertService from '../../../services/alertService';

const MAX_BYTES_FILE = 15 * 1024 * 1024; // 15 MB

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

let _tempCounter = 0;
const nextTempId = () => `tmp-${Date.now()}-${++_tempCounter}`;

const PdfsManagerDialog = () => {
  const dispatch = useDispatch();
  const manager = useSelector(selectPdfsManager);
  const hasChanges = useSelector(selectPdfsHasChanges);

  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);     // id de PDF existente en edición
  const [editingTempId, setEditingTempId] = useState(null); // tempId de file nuevo en edición
  const [draftDescripcion, setDraftDescripcion] = useState('');

  // Preview state — un único PDF visible a la vez
  const [preview, setPreview] = useState({ open: false, name: '', url: '', loading: false });
  const previewUrlRef = useRef(null); // referencia a URL blob para revocarla

  const releasePreviewUrl = () => {
    if (previewUrlRef.current) {
      try { window.URL.revokeObjectURL(previewUrlRef.current); } catch (_e) { /* noop */ }
      previewUrlRef.current = null;
    }
  };

  // Limpiar URL blob al cerrar el manager o desmontar
  useEffect(() => () => releasePreviewUrl(), []);

  const openPreviewExisting = async (pdf) => {
    releasePreviewUrl();
    setPreview({ open: true, name: pdf.nombre_original, url: '', loading: true });
    const url = await dispatch(fetchPdfBlobUrlThunk(manager.finalizado.id, pdf.id));
    if (!url) {
      setPreview({ open: false, name: '', url: '', loading: false });
      return;
    }
    previewUrlRef.current = url;
    setPreview({ open: true, name: pdf.nombre_original, url, loading: false });
  };

  const openPreviewNew = (file) => {
    releasePreviewUrl();
    const f = getCachedPdfFile(file.tempId);
    if (!f) {
      setPreview({ open: false, name: '', url: '', loading: false });
      return;
    }
    const url = window.URL.createObjectURL(f);
    previewUrlRef.current = url;
    setPreview({ open: true, name: file.name, url, loading: false });
  };

  const closePreview = () => {
    releasePreviewUrl();
    setPreview({ open: false, name: '', url: '', loading: false });
  };

  const openPreviewInTab = () => {
    if (preview.url) window.open(preview.url, '_blank');
  };

  // Cargar lista al abrir
  useEffect(() => {
    if (manager.open && manager.finalizado?.id) {
      dispatch(loadPdfsThunk(manager.finalizado.id));
    }
  }, [manager.open, manager.finalizado?.id, dispatch]);

  if (!manager.open) return null;

  const handleClose = async () => {
    if (hasChanges) {
      const result = await AlertService.confirm(
        '¿Descartar cambios?',
        'Tienes cambios sin guardar. Si cierras ahora, se perderán.',
        { confirmText: 'Sí, descartar', cancelText: 'Seguir editando' }
      );
      if (!result.isConfirmed) return;
    }
    closePreview();
    clearPdfFileCache();
    dispatch(closePdfsManager());
  };

  const handleFiles = (filesList) => {
    const files = Array.from(filesList || []);
    const validos = [];
    for (const f of files) {
      const ext = (f.name || '').toLowerCase().split('.').pop();
      const okType = f.type === 'application/pdf' || ext === 'pdf';
      if (!okType) {
        AlertService.error('Tipo no permitido', `"${f.name}" no es un PDF.`);
        continue;
      }
      if (f.size > MAX_BYTES_FILE) {
        AlertService.error('Archivo demasiado grande', `"${f.name}" supera 15 MB.`);
        continue;
      }
      validos.push(f);
    }
    for (const file of validos) {
      const tempId = nextTempId();
      cachePdfFile(tempId, file);
      dispatch(addNewFile({ tempId, name: file.name, size: file.size, descripcion: '' }));
    }
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const startEditExisting = (pdf) => {
    setEditingId(pdf.id);
    setEditingTempId(null);
    const pending = manager.pendingMetaUpdates?.[pdf.id];
    setDraftDescripcion(pending?.descripcion ?? pdf.descripcion ?? '');
  };

  const saveEditExisting = (pdf) => {
    dispatch(setPendingMeta({ id: pdf.id, descripcion: draftDescripcion }));
    setEditingId(null);
    setDraftDescripcion('');
  };

  const startEditNew = (file) => {
    setEditingTempId(file.tempId);
    setEditingId(null);
    setDraftDescripcion(file.descripcion || '');
  };

  const saveEditNew = (file) => {
    dispatch(updateNewFile({ tempId: file.tempId, descripcion: draftDescripcion }));
    setEditingTempId(null);
    setDraftDescripcion('');
  };

  const handleCommit = () => {
    dispatch(commitPdfsChangesThunk());
  };

  const handleDownload = (pdf) => {
    dispatch(downloadPdfThunk(manager.finalizado.id, pdf.id, pdf.nombre_original));
  };

  // Render helpers para metadata "viva" (mezcla pending con original)
  const getDescripcionMostrada = (pdf) => {
    const pending = manager.pendingMetaUpdates?.[pdf.id];
    return pending?.descripcion ?? pdf.descripcion ?? '';
  };

  const isMarkedDelete = (id) => manager.pendingDelete.includes(id);
  const totalNuevos = manager.newFiles.length;

  return (
    <Dialog open={manager.open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6">
            PDFs · Finalizado #{manager.finalizado?.id || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {manager.finalizado?.placa || ''}{manager.finalizado?.cliente?.nombre ? ` · ${manager.finalizado.cliente.nombre}` : ''}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 360 }}>
        {/* Drop zone */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          hidden
          onChange={handleInputChange}
        />
        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 3,
            mb: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            Arrastra PDFs aquí o haz clic para seleccionar
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Máx. 15 MB por archivo · solo PDF
          </Typography>
        </Box>

        {/* Existentes */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Ya guardados ({manager.existing.length})
        </Typography>
        {manager.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : manager.existing.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
            No hay PDFs guardados todavía.
          </Typography>
        ) : (
          <List dense disablePadding>
            {manager.existing.map((pdf) => {
              const marked = isMarkedDelete(pdf.id);
              const editing = editingId === pdf.id;
              return (
                <ListItem
                  key={pdf.id}
                  sx={{
                    border: '1px solid',
                    borderColor: marked ? 'error.light' : 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: marked ? 'error.50' : 'background.paper',
                    opacity: marked ? 0.65 : 1,
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {!marked && !editing && (
                        <Tooltip title="Editar descripción">
                          <IconButton size="small" onClick={() => startEditExisting(pdf)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {editing && (
                        <Tooltip title="Confirmar">
                          <IconButton size="small" color="success" onClick={() => saveEditExisting(pdf)}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Ver contenido">
                        <IconButton size="small" color="info" onClick={() => openPreviewExisting(pdf)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Descargar">
                        <IconButton size="small" onClick={() => handleDownload(pdf)}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {marked ? (
                        <Tooltip title="Restaurar">
                          <IconButton size="small" color="primary" onClick={() => dispatch(unmarkPdfForDelete(pdf.id))}>
                            <RestoreFromTrashIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Marcar para eliminar">
                          <IconButton size="small" color="error" onClick={() => dispatch(markPdfForDelete(pdf.id))}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PictureAsPdfIcon color={marked ? 'disabled' : 'error'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ textDecoration: marked ? 'line-through' : 'none' }}
                        >
                          {pdf.nombre_original}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatSize(pdf.tamano_bytes)}
                        </Typography>
                        {marked && <Chip size="small" label="Eliminar" color="error" variant="outlined" />}
                      </Box>
                    }
                    secondary={
                      editing ? (
                        <TextField
                          size="small"
                          fullWidth
                          autoFocus
                          placeholder="Descripción"
                          value={draftDescripcion}
                          onChange={(e) => setDraftDescripcion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditExisting(pdf);
                            if (e.key === 'Escape') {
                              setEditingId(null);
                              setDraftDescripcion('');
                            }
                          }}
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {getDescripcionMostrada(pdf) || <em>Sin descripción</em>}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}

        {totalNuevos > 0 && <Divider sx={{ my: 2 }} />}

        {/* Nuevos */}
        {totalNuevos > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.main' }}>
              Pendientes de subir ({totalNuevos})
            </Typography>
            <List dense disablePadding>
              {manager.newFiles.map((nf) => {
                const editing = editingTempId === nf.tempId;
                return (
                  <ListItem
                    key={nf.tempId}
                    sx={{
                      border: '1px solid',
                      borderColor: 'success.light',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'success.50',
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!editing && (
                          <Tooltip title="Editar descripción">
                            <IconButton size="small" onClick={() => startEditNew(nf)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {editing && (
                          <Tooltip title="Confirmar">
                            <IconButton size="small" color="success" onClick={() => saveEditNew(nf)}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Ver contenido">
                          <IconButton size="small" color="info" onClick={() => openPreviewNew(nf)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Quitar de la lista">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              dispatch(removeNewFile(nf.tempId));
                              clearPdfFileCache(nf.tempId);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PictureAsPdfIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {nf.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatSize(nf.size)}
                          </Typography>
                          <Chip size="small" label="Nuevo" color="success" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        editing ? (
                          <TextField
                            size="small"
                            fullWidth
                            autoFocus
                            placeholder="Descripción"
                            value={draftDescripcion}
                            onChange={(e) => setDraftDescripcion(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditNew(nf);
                              if (e.key === 'Escape') {
                                setEditingTempId(null);
                                setDraftDescripcion('');
                              }
                            }}
                            sx={{ mt: 0.5 }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {nf.descripcion || <em>Sin descripción</em>}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={manager.saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleCommit}
          disabled={!hasChanges || manager.saving}
          startIcon={manager.saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {manager.saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </DialogActions>

      {/* Preview de PDF — modal-on-modal */}
      <Dialog open={preview.open} onClose={closePreview} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <PictureAsPdfIcon color="error" />
            <Typography variant="subtitle1" noWrap title={preview.name}>
              {preview.name || 'Vista previa'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Abrir en pestaña">
              <span>
                <IconButton size="small" onClick={openPreviewInTab} disabled={!preview.url}>
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton size="small" onClick={closePreview}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '78vh', bgcolor: '#525659' }}>
          {preview.loading ? (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : preview.url ? (
            <iframe
              key={preview.url}
              src={preview.url}
              title={preview.name || 'PDF'}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'common.white' }}>
              <Typography variant="body2">No se pudo cargar el PDF.</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default PdfsManagerDialog;

import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  alpha,
} from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PAGINATION_OPTIONS } from '../../../utils/constants';

const Pagination = ({
  page = 0,
  pageSize = 25,
  totalRows = 0,
  onPageChange,
  onPageSizeChange,
  rowsPerPageOptions = PAGINATION_OPTIONS,
  showFirstLastButtons = true,
  showRowsInfo = true,
  compact = false,
}) => {
  const theme = useTheme();

  const totalPages = Math.ceil(totalRows / pageSize);
  const from = totalRows === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalRows);

  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  const handleFirstPage = () => {
    if (onPageChange && canGoPrevious) {
      onPageChange(0);
    }
  };

  const handlePreviousPage = () => {
    if (onPageChange && canGoPrevious) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (onPageChange && canGoNext) {
      onPageChange(page + 1);
    }
  };

  const handleLastPage = () => {
    if (onPageChange && canGoNext) {
      onPageChange(totalPages - 1);
    }
  };

  const handlePageSizeChange = (event) => {
    if (onPageSizeChange) {
      onPageSizeChange(event.target.value);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = compact ? 3 : 5;

    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const NavigationButton = ({ onClick, disabled, icon, tooltip }) => (
    <Tooltip title={tooltip} arrow>
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled}
          size="small"
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            transition: 'all 0.2s ease',
            color: disabled ? 'action.disabled' : 'text.secondary',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              transform: 'scale(1.05)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );

  const PageButton = ({ pageNum }) => {
    const isActive = pageNum === page;

    return (
      <IconButton
        onClick={() => onPageChange && onPageChange(pageNum)}
        size="small"
        sx={{
          minWidth: 36,
          height: 36,
          borderRadius: 1.5,
          fontSize: '0.875rem',
          fontWeight: isActive ? 600 : 400,
          transition: 'all 0.2s ease',
          backgroundColor: isActive ? 'primary.main' : 'transparent',
          color: isActive ? 'primary.contrastText' : 'text.secondary',
          '&:hover': {
            backgroundColor: isActive
              ? 'primary.dark'
              : alpha(theme.palette.primary.main, 0.08),
            color: isActive ? 'primary.contrastText' : 'primary.main',
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {pageNum + 1}
      </IconButton>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        px: 2,
        py: 1.5,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.background.default, 0.5),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap' }}
          >
            Mostrar
          </Typography>
          <FormControl size="small">
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              sx={{
                minWidth: 70,
                height: 36,
                borderRadius: 1.5,
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: 1,
                },
              }}
            >
              {rowsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap' }}
          >
            por página
          </Typography>
        </Box>

        {showRowsInfo && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'primary.main',
                fontWeight: 500,
              }}
            >
              {totalRows === 0 ? (
                'Sin registros'
              ) : (
                <>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {from}-{to}
                  </Box>
                  {' de '}
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {totalRows.toLocaleString()}
                  </Box>
                  {' registros'}
                </>
              )}
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          justifyContent: { xs: 'center', sm: 'flex-end' },
        }}
      >
        {showFirstLastButtons && (
          <NavigationButton
            onClick={handleFirstPage}
            disabled={!canGoPrevious}
            icon={<FirstPageIcon fontSize="small" />}
            tooltip="Primera página"
          />
        )}

        <NavigationButton
          onClick={handlePreviousPage}
          disabled={!canGoPrevious}
          icon={<ChevronLeftIcon fontSize="small" />}
          tooltip="Página anterior"
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mx: 1,
          }}
        >
          {pageNumbers.length > 0 && pageNumbers[0] > 0 && (
            <>
              <PageButton pageNum={0} />
              {pageNumbers[0] > 1 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 0.5 }}
                >
                  ...
                </Typography>
              )}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <PageButton key={pageNum} pageNum={pageNum} />
          ))}

          {pageNumbers.length > 0 && pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 0.5 }}
                >
                  ...
                </Typography>
              )}
              <PageButton pageNum={totalPages - 1} />
            </>
          )}
        </Box>

        <NavigationButton
          onClick={handleNextPage}
          disabled={!canGoNext}
          icon={<ChevronRightIcon fontSize="small" />}
          tooltip="Página siguiente"
        />

        {showFirstLastButtons && (
          <NavigationButton
            onClick={handleLastPage}
            disabled={!canGoNext}
            icon={<LastPageIcon fontSize="small" />}
            tooltip="Última página"
          />
        )}
      </Box>
    </Box>
  );
};

export default Pagination;

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { DATE_FORMAT, DATE_TIME_FORMAT, INSPECTION_STATUS_COLORS } from './constants';

dayjs.locale('es');

export const formatDate = (date, format = DATE_FORMAT) => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format(DATE_TIME_FORMAT);
};

export const formatCurrency = (amount, currency = 'COP') => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '-';
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return `${formatNumber(value, decimals)}%`;
};

export const getStatusColor = (status) => {
  return INSPECTION_STATUS_COLORS[status] || 'default';
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isThisMonth = (date) => {
  return dayjs(date).isSame(dayjs(), 'month');
};

export const getDaysUntil = (date) => {
  const target = dayjs(date);
  const today = dayjs();
  return target.diff(today, 'day');
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const downloadFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const parseQueryParams = (searchString) => {
  const params = new URLSearchParams(searchString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

export const buildQueryString = (params) => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => [key, String(value)]);
  return new URLSearchParams(filteredParams).toString();
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export const sortByDate = (array, key, ascending = false) => {
  return [...array].sort((a, b) => {
    const dateA = dayjs(a[key]);
    const dateB = dayjs(b[key]);
    return ascending ? dateA.diff(dateB) : dateB.diff(dateA);
  });
};

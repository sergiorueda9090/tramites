import api from '../../services/api';
import AlertService from '../../services/alertService';
import { showBackdrop, hideBackdrop } from '../uiStore/uiStore';
import { setLoading, setError, setResultado } from './cotizadorRapidoSlice';

const API = {
  placa: '/api/cotizador_rapido/placa/',                 // Previsora por placa (devuelve precio + Vin)
  runtVehiculoVin: '/api/cotizador_rapido/runt_vehiculo_vin/', // Consulta normal por VIN (comparación)
};

/**
 * Convierte un valor monetario a número entero de pesos.
 * Ej: "$ 343.300" → 343300 ; 343300 → 343300 ; "343.300,00" → 343300
 */
export const parseMoneda = (val) => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return Math.round(val);
  // Tomar solo la parte entera: quitar separadores de miles y decimales.
  const limpio = String(val).split(',')[0];     // descarta decimales con coma
  const digits = limpio.replace(/[^\d]/g, '');  // "$ 343.300" -> "343300"
  if (!digits) return null;
  return parseInt(digits, 10);
};

/**
 * Extrae el precio SOAT de la respuesta de runt_vehiculo_vin (consulta normal).
 *
 * ⚠ El nombre exacto del campo depende del scraper. Se prueban varios candidatos
 * conocidos; ajusta/añade aquí el campo correcto cuando se confirme la respuesta.
 */
export const extraerPrecioVin = (data) => {
  if (!data || typeof data !== 'object') return null;
  // El scraper puede devolver la misma forma anidada de Previsora
  // (`Data.NewTariff.TotalWithDiscountAmount`) o una forma plana. Se prueban
  // ambas; ajusta/añade aquí el campo correcto cuando se confirme la respuesta.
  const d = data.Data || data.data || data;
  const tarifa = d.NewTariff || d.newTariff || null;
  const candidatos = [
    tarifa ? tarifa.TotalWithDiscountAmount : null,
    tarifa ? tarifa.TotalWithDiscountAmountFormatted : null,
    tarifa ? tarifa.Total : null,
    d.TotalWithDiscountAmountFormatted,
    d.TotalWithDiscountAmount,
    d.precio,
    d.precio_soat,
    d.valor,
    d.valor_soat,
    d.tarifa,
    Array.isArray(d.soat) && d.soat[0] ? (d.soat[0].valorPrima || d.soat[0].valor || d.soat[0].precio) : null,
  ];
  for (const c of candidatos) {
    const n = parseMoneda(c);
    if (n != null) return n;
  }
  return null;
};

/**
 * Cotización rápida por placa.
 * 1) Previsora (precio principal a mostrar) + Vin.
 * 2) Consulta normal por VIN para comparar el precio.
 * Guarda el resultado en el store; la notificación de "no coinciden / caso
 * especial" la dispara la página (informativa).
 */
export const cotizarRapidoThunk = (placa) => {
  return async (dispatch) => {
    const placaLimpia = (placa || '').trim().toUpperCase();
    if (!placaLimpia) {
      AlertService.error('Placa requerida', 'Ingresa una placa para cotizar.');
      return null;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      dispatch(showBackdrop('Consultando Previsora...'));

      // 1) Previsora por placa.
      // La respuesta llega anidada: { Data: { Vin, NewTariff: { TotalWithDiscountAmount(Formatted) } }, Success }
      // (la vista `external_placa` reenvía la respuesta del servicio tal cual).
      // Se mantienen accesos planos como fallback por si el backend la aplana a futuro.
      const prevResp = await api.post(API.placa, { placa: placaLimpia });
      const previsoraRaw = prevResp.data || {};
      const previsoraData = previsoraRaw.Data || previsoraRaw.data || previsoraRaw;
      const previsoraTarifa = previsoraData.NewTariff || previsoraData.newTariff || {};
      const previsoraPrecioFmt =
        previsoraTarifa.TotalWithDiscountAmountFormatted ||
        previsoraTarifa.TotalFormatted ||
        previsoraRaw.TotalWithDiscountAmountFormatted ||
        null;
      const previsoraPrecio = parseMoneda(
        previsoraTarifa.TotalWithDiscountAmount ??
        previsoraTarifa.Total ??
        previsoraPrecioFmt
      );
      const vin =
        previsoraData.Vin ||
        previsoraData.vin ||
        previsoraRaw.Vin ||
        previsoraRaw.vin ||
        '';
      const previsoraTariffCode =
        previsoraTarifa.TariffCode || previsoraTarifa.tariffCode || null;

      // 2) Consulta normal por VIN (comparación).
      // El endpoint runt_vehiculo_vin NO devuelve un precio: trae los datos RUNT
      // del vehículo y el historial de SOAT, donde cada póliza expone su
      // `tipoTarifa` (código de tarifa) pero ningún valor en pesos. Como el precio
      // del SOAT lo determina el código de tarifa, la validación compara el código
      // que aplicó Previsora contra el del SOAT vigente del RUNT.
      let runtRaw = null;
      let runtPrecio = null;          // se sigue intentando, por si el scraper añade precio a futuro
      let runtTariffCode = null;
      let runtSoatVigente = null;
      if (vin) {
        dispatch(showBackdrop('Comparando con la consulta por VIN...'));
        try {
          const runtResp = await api.get(API.runtVehiculoVin, { params: { vin } });
          runtRaw = runtResp.data || {};
          runtPrecio = extraerPrecioVin(runtRaw);
          const soatList = Array.isArray(runtRaw.soat) ? runtRaw.soat : [];
          runtSoatVigente =
            soatList.find((s) => String(s.estado || '').toUpperCase() === 'VIGENTE') ||
            soatList[0] ||
            null;
          runtTariffCode = runtSoatVigente?.tipoTarifa || null;
        } catch (e) {
          runtRaw = null;
          runtPrecio = null;
          runtTariffCode = null;
          runtSoatVigente = null;
        }
      }

      // Si el scraper llegara a traer precio, se compara precio↔precio; si no,
      // se compara el código de tarifa (camino real hoy).
      const preciosComparables = previsoraPrecio != null && runtPrecio != null;
      const codigosComparables = previsoraTariffCode != null && runtTariffCode != null;
      const coinciden = preciosComparables
        ? previsoraPrecio === runtPrecio
        : codigosComparables
          ? String(previsoraTariffCode) === String(runtTariffCode)
          : false;
      // Caso especial: sin VIN, sin precio de Previsora, o sin nada comparable
      // contra la consulta normal (ni precio ni código de tarifa).
      const esCasoEspecial =
        !vin || previsoraPrecio == null || (!preciosComparables && !codigosComparables);

      const resultado = {
        placa: placaLimpia,
        vin,
        previsoraPrecio,
        previsoraPrecioFmt,
        previsoraTariffCode,
        runtPrecio,
        runtTariffCode,
        runtSoatVigente,
        coinciden,
        esCasoEspecial,
        previsoraRaw,
        runtRaw,
      };

      dispatch(setResultado(resultado));
      dispatch(hideBackdrop());
      dispatch(setLoading(false));
      return resultado;

    } catch (error) {
      dispatch(hideBackdrop());
      dispatch(setLoading(false));
      const message = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'No se pudo cotizar la placa';
      dispatch(setError(message));
      AlertService.error('Error', message);
      return null;
    }
  };
};

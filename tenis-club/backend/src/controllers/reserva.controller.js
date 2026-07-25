const Reserva = require("../models/reserva.model");
const Config = require("../models/config.model");
const Factura = require("../models/factura.model");

exports.listar = async (req, res) => {
  const reservas = await Reserva.getAll();
  res.json(reservas);
};

exports.crear = async (req, res) => {
  try {
    const nueva = await Reserva.crear(req.body);
    res.status(201).json(nueva);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.cancelar = async (req, res) => {
  try {
    const reserva = await Reserva.cancelar(Number(req.params.id));
    res.json(reserva);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.registrarUso = async (req, res) => {
  try {
    const reserva = await Reserva.registrarUso(Number(req.params.id), req.body.uso);
    res.json(reserva);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.porSocio = async (req, res) => {
  const reservas = await Reserva.getBySocio(Number(req.params.socioId));
  res.json(reservas);
};

/*=========================
  HU12 — IMPORTE POR USO
=========================*/
exports.calcularImporteUso = async (req, res) => {
  try {
    const { socioId } = req.params;
    const { mes, anio } = req.query;
    if (!mes || !anio) throw new Error("Debe proporcionar mes y anio como query params");

    const config = await Config.getConfig();
    const usadas = await Reserva.getUsadasPorSocioYPeriodo(socioId, mes, anio);

    const totalHoras = usadas.length; // cada bloque = 1 hora
    const importeUso = totalHoras * config.precioActual;

    res.json({
      socioId: Number(socioId),
      mes: Number(mes),
      anio: Number(anio),
      totalHoras,
      precioPorHora: config.precioActual,
      importeUso,
      detalle: usadas.map(r => ({
        id: r.id,
        fecha: r.fecha,
        hora: r.hora,
        pistaId: r.pistaId,
        subtotal: config.precioActual
      }))
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

/*=========================
  HU14 — EMISIÓN DE FACTURA
=========================*/
exports.emitirFactura = async (req, res) => {
  try {
    const { socioId, mes, anio } = req.body;
    if (!socioId || !mes || !anio) throw new Error("Faltan datos: socioId, mes, anio");

    const config = await Config.getConfig();

    // 1. Uso de pistas (HU12)
    const usadas = await Reserva.getUsadasPorSocioYPeriodo(socioId, mes, anio);
    const subtotalUso = usadas.length * config.precioActual;

    // 2. Penalizaciones (base para HU13 de tu compañera)
    const penalizables = await Reserva.getPenalizablesPorSocioYPeriodo(socioId, mes, anio);
    let subtotalPenalizaciones = 0;
    const lineasPenalizacion = [];

    penalizables.forEach(r => {
      // Si ya tiene penalización calculada (cancelar la guarda), úsala; si no, calcúlala al vuelo
      let monto = r.penalizacion;
      if (monto === undefined || monto === null) {
        monto = Math.max(config.precioActual, config.tarifaCastigo);
      }
      subtotalPenalizaciones += monto;
      lineasPenalizacion.push({
        concepto: `Penalización — Reserva ${r.fecha} ${r.hora} (Pista ${r.pistaId})`,
        cantidad: 1,
        precioUnitario: monto,
        subtotal: monto,
        tipo: "penalizacion",
        reservaId: r.id
      });
    });

    // 3. Líneas de uso
    const lineasUso = usadas.map(r => ({
      concepto: `Uso de pista — ${r.fecha} ${r.hora} (Pista ${r.pistaId})`,
      cantidad: 1,
      precioUnitario: config.precioActual,
      subtotal: config.precioActual,
      tipo: "uso",
      reservaId: r.id
    }));

    const total = subtotalUso + subtotalPenalizaciones;

    // 4. Evitar duplicados
    const existentes = await Factura.getBySocio(socioId, { mes, anio });
    const yaEmitida = existentes.find(f => f.estado === "Emitida" || f.estado === "Pendiente");
    if (yaEmitida) {
      throw new Error(`Ya existe una factura para el periodo ${mes}/${anio}. ID: ${yaEmitida.id}`);
    }

    // 5. Crear factura consolidada
    const factura = await Factura.crear({
      socioId,
      mes,
      anio,
      lineas: [...lineasUso, ...lineasPenalizacion],
      subtotalUso,
      subtotalPenalizaciones,
      total,
      estado: "Emitida",
      observaciones: `Factura generada para periodo ${mes}/${anio}`
    });

    res.status(201).json(factura);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

module.exports = {
  listar: exports.listar,
  crear: exports.crear,
  cancelar: exports.cancelar,
  registrarUso: exports.registrarUso,
  porSocio: exports.porSocio,
  calcularImporteUso: exports.calcularImporteUso,
  emitirFactura: exports.emitirFactura
};
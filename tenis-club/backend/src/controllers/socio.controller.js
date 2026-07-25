const Socio = require("../models/socio.model");
const Reserva = require("../models/reserva.model");
const Factura = require("../models/factura.model");
const Pista = require("../models/pista.model");

exports.listar = async (req, res) => {
  const socios = await Socio.getAll();
  res.json(socios);
};

exports.crear = async (req, res) => {
  try {
    const nuevo = await Socio.crear(req.body);
    res.status(201).json(nuevo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.baja = async (req, res) => {
  try {
    const socio = await Socio.darDeBaja(Number(req.params.id));
    res.json(socio);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.reactivar = async (req, res) => {
  try {
    const socio = await Socio.reactivar(Number(req.params.id));
    res.json(socio);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.modificar = async (req, res) => {
  try {
    const socio = await Socio.modificar(Number(req.params.id), req.body);
    res.json(socio);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

/* =========================
   HU15 — Historial del Socio
   (Programador 3 — Perfil del Socio y Auditoría)
========================= */

// Traduce el estado interno de una reserva al estado de asistencia
// que pide la maqueta: "Ocupada" / "Pendiente".
// Nota: una reserva "cancelada" no tiene asistencia aplicable, y una
// reserva activa cuyo bloque ya cerró como "no_ocupada" (no-show) se
// agrupa dentro de "Pendiente" porque la HU15 solo contempla esos dos
// estados. Si más adelante se necesita distinguir el no-show en esta
// vista, se puede agregar un tercer valor sin romper el contrato actual.
function mapearAsistencia(reserva) {
  if (reserva.estado === "cancelada") return "No aplica";
  if (reserva.uso === "usada") return "Ocupada";
  return "Pendiente";
}

exports.historial = async (req, res) => {
  try {
    const socioId = Number(req.params.id);

    const socio = await Socio.getById(socioId);
    if (!socio) {
      return res.status(404).json({ error: "Socio no encontrado." });
    }

    const [reservas, facturas, pistas] = await Promise.all([
      Reserva.getBySocio(socioId),
      Factura.getBySocio(socioId),
      Pista.getAll(),
    ]);

    const pistaPorId = new Map(pistas.map(p => [p.id, p]));

    const reservasHistorial = [...reservas]
      .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora))
      .map(r => {
        const pista = pistaPorId.get(r.pistaId);
        return {
          id: r.id,
          fecha: r.fecha,
          hora: r.hora,
          pistaId: r.pistaId,
          pistaNombre: pista ? pista.nombre : "Pista eliminada",
          estado: r.estado,                     // "activa" | "cancelada"
          asistencia: mapearAsistencia(r),       // "Ocupada" | "Pendiente" | "No aplica"
          penalizacion: r.penalizacion ?? null,
        };
      });

    const facturasHistorial = [...facturas]
      .sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision))
      .map(f => ({
        id: f.id,
        periodo: f.periodo,
        mes: f.mes,
        anio: f.anio,
        total: f.total,
        estado: f.estado,          // "Pendiente" | "Pagada"
        fechaEmision: f.fechaEmision,
        pagadoEn: f.pagadoEn,
      }));

    res.json({
      socio: {
        id: socio.id,
        numeroSocio: socio.numeroSocio,
        nombre: socio.nombre,
        telefono: socio.telefono,
        email: socio.email,
        activo: socio.activo,
      },
      reservas: reservasHistorial,
      facturas: facturasHistorial,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
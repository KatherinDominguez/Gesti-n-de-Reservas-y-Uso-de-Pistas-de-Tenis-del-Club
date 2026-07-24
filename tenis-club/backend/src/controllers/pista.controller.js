const Pista = require("../models/pista.model");
const Reserva = require("../models/reserva.model");

exports.listar = async (req, res) => {
  const pistas = await Pista.getAll();
  res.json(pistas);
};

// SO01 — Disponibilidad de una pista en una fecha dada: GET /api/pistas/:id/disponibilidad?fecha=YYYY-MM-DD
exports.disponibilidad = async (req, res) => {
  try {
    const pistaId = Number(req.params.id);
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: "Falta el parámetro 'fecha' (YYYY-MM-DD)." });
    const ocupadas = await Reserva.getDisponibilidad(pistaId, fecha);
    res.json({ pistaId, fecha, ocupadas });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
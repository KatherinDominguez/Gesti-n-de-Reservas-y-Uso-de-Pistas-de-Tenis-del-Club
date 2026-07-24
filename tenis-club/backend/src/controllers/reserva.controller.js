const Reserva = require("../models/reserva.model");

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

exports.porSocio = async (req, res) => {
  const reservas = await Reserva.getBySocio(Number(req.params.socioId));
  res.json(reservas);
};
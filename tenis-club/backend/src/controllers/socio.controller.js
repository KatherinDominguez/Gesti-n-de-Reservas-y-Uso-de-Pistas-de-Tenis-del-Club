const Socio = require("../models/socio.model");

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
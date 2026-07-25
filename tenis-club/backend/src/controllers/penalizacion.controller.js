const Penalizacion = require("../models/penalizacion.model");

exports.obtener = async (req, res) => {
  const data = await Penalizacion.getPenalizacion();
  res.json(data);
};

exports.actualizar = async (req, res) => {
  try {
    const { nuevo } = req.body;
    if (typeof nuevo !== "number" || nuevo <= 0) {
      return res.status(400).json({ error: "Penalización inválida." });
    }
    const data = await Penalizacion.actualizarPenalizacion(nuevo);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
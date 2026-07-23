const Precio = require("../models/precio.model");

exports.obtener = async (req, res) => {
  const data = await Precio.getPrecio();
  res.json(data);
};

exports.actualizar = async (req, res) => {
  try {
    const { nuevo } = req.body;
    if (typeof nuevo !== "number" || nuevo <= 0) {
      return res.status(400).json({ error: "Precio inválido." });
    }
    const data = await Precio.actualizarPrecio(nuevo);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
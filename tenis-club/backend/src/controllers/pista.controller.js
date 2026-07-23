const Pista = require("../models/pista.model");

exports.listar = async (req, res) => {
  const pistas = await Pista.getAll();
  res.json(pistas);
};
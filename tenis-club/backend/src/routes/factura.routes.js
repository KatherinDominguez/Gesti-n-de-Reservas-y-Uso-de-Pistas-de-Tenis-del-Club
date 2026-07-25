const router = require("express").Router();
const Factura = require("../models/factura.model");

router.get("/socio/:socioId", async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const facturas = await Factura.getBySocio(req.params.socioId, { mes, anio });
    res.json(facturas);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const f = await Factura.getById(Number(req.params.id));
    if (!f) throw new Error("Factura no encontrada");
    res.json(f);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id/pagar", async (req, res) => {
  try {
    const f = await Factura.marcarComoPagada(Number(req.params.id));
    res.json(f);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
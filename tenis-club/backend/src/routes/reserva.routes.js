const router = require("express").Router();
const c = require("../controllers/reserva.controller");

router.get("/", c.listar);
router.post("/", c.crear);
router.put("/:id/cancelar", c.cancelar);
router.put("/:id/uso", c.registrarUso);
router.get("/socio/:socioId", c.porSocio);

// HU12 / HU14
router.get("/facturacion/uso/:socioId", c.calcularImporteUso);
router.post("/facturacion/emitir", c.emitirFactura);

module.exports = router;
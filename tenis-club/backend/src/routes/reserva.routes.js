const router = require("express").Router();
const c = require("../controllers/reserva.controller");

router.get("/", c.listar);
router.post("/", c.crear);
router.patch("/:id/cancelar", c.cancelar);
router.get("/socio/:socioId", c.porSocio);
router.patch("/:id/uso", c.registrarUso);

module.exports = router;
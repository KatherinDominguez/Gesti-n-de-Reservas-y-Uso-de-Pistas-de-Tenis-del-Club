const router = require("express").Router();
const c = require("../controllers/pista.controller");

router.get("/", c.listar);
router.get("/:id/disponibilidad", c.disponibilidad);

module.exports = router;
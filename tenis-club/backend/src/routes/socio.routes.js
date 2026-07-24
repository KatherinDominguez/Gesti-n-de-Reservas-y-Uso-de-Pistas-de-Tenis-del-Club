const router = require("express").Router();
const c = require("../controllers/socio.controller");

router.get("/", c.listar);
router.post("/", c.crear);
router.patch("/:id/baja", c.baja);
router.patch("/:id/reactivar", c.reactivar);
router.put("/:id", c.modificar);

module.exports = router;
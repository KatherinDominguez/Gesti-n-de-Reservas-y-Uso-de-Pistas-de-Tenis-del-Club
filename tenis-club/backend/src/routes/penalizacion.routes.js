const router = require("express").Router();
const c = require("../controllers/penalizacion.controller");

router.get("/", c.obtener);
router.put("/", c.actualizar);

module.exports = router;
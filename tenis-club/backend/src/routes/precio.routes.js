const router = require("express").Router();
const c = require("../controllers/precio.controller");

router.get("/", c.obtener);
router.put("/", c.actualizar);

module.exports = router;
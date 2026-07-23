const router = require("express").Router();
const c = require("../controllers/pista.controller");

router.get("/", c.listar);

module.exports = router;
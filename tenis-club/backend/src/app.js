const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/pistas", require("./routes/pista.routes"));
app.use("/api/precio", require("./routes/precio.routes"));
app.use("/api/penalizacion", require("./routes/penalizacion.routes"));
app.use("/api/socios", require("./routes/socio.routes"));
app.use("/api/reservas", require("./routes/reserva.routes"));
app.use("/api/facturas", require("./routes/factura.routes"));

module.exports = app;
const { readJSON, writeJSON } = require("../utils/fileStore");

async function getPenalizacion() {
  return readJSON("penalizacion.json");
}

async function actualizarPenalizacion(nuevo) {
  const data = await getPenalizacion();
  const anterior = data.actual;
  data.historial.push({ fecha: new Date().toISOString(), anterior, nuevo });
  data.actual = nuevo;
  await writeJSON("penalizacion.json", data);
  return data;
}

module.exports = { getPenalizacion, actualizarPenalizacion };
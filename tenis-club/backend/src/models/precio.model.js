const { readJSON, writeJSON } = require("../utils/fileStore");

async function getPrecio() {
  return readJSON("precio.json");
}

async function actualizarPrecio(nuevo) {
  const data = await getPrecio();
  const anterior = data.actual;
  data.historial.push({ fecha: new Date().toISOString(), anterior, nuevo });
  data.actual = nuevo;
  await writeJSON("precio.json", data);
  return data;
}

module.exports = { getPrecio, actualizarPrecio };
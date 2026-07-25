const { readJSON, writeJSON } = require("../utils/fileStore");
const FILE = "config.json";

async function getConfig() {
  try {
    const cfg = await readJSON(FILE);
    return cfg || { precioActual: 40, tarifaCastigo: 0 };
  } catch {
    return { precioActual: 40, tarifaCastigo: 0 };
  }
}

async function updateConfig(data) {
  const cfg = await getConfig();
  if (data.precioActual !== undefined) cfg.precioActual = Number(data.precioActual);
  if (data.tarifaCastigo !== undefined) cfg.tarifaCastigo = Number(data.tarifaCastigo);
  await writeJSON(FILE, cfg);
  return cfg;
}

module.exports = { getConfig, updateConfig };
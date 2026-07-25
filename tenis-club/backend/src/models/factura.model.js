const { readJSON, writeJSON } = require("../utils/fileStore");
const FILE = "facturas.json";

async function getAll() {
  return readJSON(FILE);
}

async function getById(id) {
  const facturas = await readJSON(FILE);
  return facturas.find(f => f.id === Number(id));
}

async function getBySocio(socioId, { mes, anio } = {}) {
  const facturas = await readJSON(FILE);
  let resultado = facturas.filter(f => f.socioId === Number(socioId));
  if (mes && anio) {
    resultado = resultado.filter(f => f.mes === Number(mes) && f.anio === Number(anio));
  }
  return resultado.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
}

async function crear(data) {
  const facturas = await readJSON(FILE);
  const nueva = {
    id: facturas.length ? Math.max(...facturas.map(f => f.id)) + 1 : 1,
    socioId: Number(data.socioId),
    mes: Number(data.mes),
    anio: Number(data.anio),
    fechaEmision: data.fechaEmision || new Date().toISOString(),
    periodo: `${String(data.mes).padStart(2, "0")}/${data.anio}`,
    lineas: data.lineas || [],
    subtotalUso: Number(data.subtotalUso || 0),
    subtotalPenalizaciones: Number(data.subtotalPenalizaciones || 0),
    total: Number(data.total || 0),
    estado: data.estado || "Pendiente",
    pagadoEn: null,
    emitidaEn: data.estado === "Emitida" ? new Date().toISOString() : null,
    observaciones: data.observaciones || ""
  };
  facturas.push(nueva);
  await writeJSON(FILE, facturas);
  return nueva;
}

async function marcarComoPagada(id) {
  const facturas = await readJSON(FILE);
  const f = facturas.find(x => x.id === Number(id));
  if (!f) throw new Error("Factura no encontrada");
  f.estado = "Pagada";
  f.pagadoEn = new Date().toISOString();
  await writeJSON(FILE, facturas);
  return f;
}

module.exports = {
  getAll,
  getById,
  getBySocio,
  crear,
  marcarComoPagada
};
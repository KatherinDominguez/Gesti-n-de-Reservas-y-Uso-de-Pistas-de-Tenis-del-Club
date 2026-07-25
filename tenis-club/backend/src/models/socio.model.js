const { readJSON, writeJSON } = require("../utils/fileStore");

const getAll = () => readJSON("socios.json");

async function getById(id) {
  const socios = await getAll();
  return socios.find(s => s.id === Number(id)) || null;
}

async function crear({ numeroSocio, nombre, telefono, email }) {
  const socios = await getAll();
  const existe = socios.some(s => s.numeroSocio === numeroSocio);
  if (existe) throw new Error("Ya existe un socio con ese número.");
  const nuevo = {
    id: Date.now(),
    numeroSocio,
    nombre,
    telefono,
    email,
    activo: true,
  };
  socios.push(nuevo);
  await writeJSON("socios.json", socios);
  return nuevo;
}

async function darDeBaja(id) {
  const socios = await getAll();
  const socio = socios.find(s => s.id === id);
  if (!socio) throw new Error("Socio no encontrado.");
  if (!socio.activo) throw new Error("El socio ya está dado de baja.");
  socio.activo = false; // baja lógica, no se borra
  await writeJSON("socios.json", socios);
  return socio;
}

async function reactivar(id) {
  const socios = await getAll();
  const socio = socios.find(s => s.id === id);
  if (!socio) throw new Error("Socio no encontrado.");
  if (socio.activo) throw new Error("El socio ya está activo.");
  socio.activo = true; // reactivación, no se toca el resto de los datos
  await writeJSON("socios.json", socios);
  return socio;
}

async function modificar(id, cambios) {
  const socios = await getAll();
  const socio = socios.find(s => s.id === id);
  if (!socio) throw new Error("Socio no encontrado.");
  if (!socio.activo) throw new Error("No se puede modificar un socio dado de baja.");
  Object.assign(socio, cambios);
  await writeJSON("socios.json", socios);
  return socio;
}

module.exports = { getAll, getById, crear, darDeBaja, reactivar, modificar };
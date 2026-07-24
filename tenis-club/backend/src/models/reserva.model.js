const { readJSON, writeJSON } = require("../utils/fileStore");
const Socio = require("./socio.model");
const Pista = require("./pista.model");

const FILE = "reservas.json";

const getAll = () => readJSON(FILE);

function combinarFechaHora(fecha, hora) {
  // fecha: "YYYY-MM-DD", hora: "HH:00"
  return new Date(`${fecha}T${hora}:00`);
}

function esMismoDia(fechaA, fechaB) {
  return fechaA.toDateString() === fechaB.toDateString();
}

// SO01 — Disponibilidad de una pista en una fecha dada
async function getDisponibilidad(pistaId, fecha) {
  const pistas = await Pista.getAll();
  const pista = pistas.find(p => p.id === Number(pistaId));
  if (!pista) throw new Error("Pista no encontrada.");

  const reservas = await getAll();
  const ocupadas = reservas
    .filter(r => r.pistaId === Number(pistaId) && r.fecha === fecha && r.estado === "activa")
    .map(r => r.hora);
  return ocupadas;
}

// SO02 — Crear una reserva
async function crear({ socioId, pistaId, fecha, hora }) {
  if (!socioId || !pistaId || !fecha || !hora) {
    throw new Error("Faltan datos de la reserva (socio, pista, fecha u hora).");
  }

  // Socio debe existir y estar activo
  const socios = await Socio.getAll();
  const socio = socios.find(s => s.id === Number(socioId));
  if (!socio) throw new Error("Socio no encontrado.");
  if (!socio.activo) throw new Error("El socio está dado de baja y no puede reservar.");

  // Pista debe existir
  const pistas = await Pista.getAll();
  const pista = pistas.find(p => p.id === Number(pistaId));
  if (!pista) throw new Error("Pista no encontrada.");

  // Fecha/hora válida y no en el pasado
  const fechaHoraReserva = combinarFechaHora(fecha, hora);
  if (isNaN(fechaHoraReserva.getTime())) throw new Error("Fecha u hora inválida.");

  const ahora = new Date();
  if (fechaHoraReserva < ahora) {
    throw new Error("No se puede reservar en una fecha u hora que ya pasó.");
  }

  // No más de un mes de anticipación
  const unMesDespues = new Date(ahora);
  unMesDespues.setMonth(unMesDespues.getMonth() + 1);
  if (fechaHoraReserva > unMesDespues) {
    throw new Error("No se pueden hacer reservas para más de un mes de anticipación.");
  }

  // El bloque (pista + fecha + hora) no debe estar ya ocupado
  const reservas = await getAll();
  const ocupado = reservas.some(r =>
    r.pistaId === Number(pistaId) &&
    r.fecha === fecha &&
    r.hora === hora &&
    r.estado === "activa"
  );
  if (ocupado) throw new Error("Ese bloque horario ya está reservado para esta pista.");

  const nueva = {
    id: Date.now(),
    socioId: Number(socioId),
    pistaId: Number(pistaId),
    fecha,
    hora,
    estado: "activa",   // "activa" | "cancelada"
    uso: null,          // null | "usada" | "no_ocupada" — se completa en el sprint de facturación (SO04+)
    creadoEn: ahora.toISOString(),
    canceladoEn: null,
  };
  reservas.push(nueva);
  await writeJSON(FILE, reservas);
  return nueva;
}

// SO03 — Cancelar una reserva (no permitido el mismo día)
async function cancelar(id) {
  const reservas = await getAll();
  const reserva = reservas.find(r => r.id === id);
  if (!reserva) throw new Error("Reserva no encontrada.");
  if (reserva.estado === "cancelada") throw new Error("La reserva ya estaba cancelada.");

  const fechaReserva = combinarFechaHora(reserva.fecha, reserva.hora);
  const ahora = new Date();
  if (esMismoDia(fechaReserva, ahora)) {
    throw new Error("No se puede cancelar una reserva para el mismo día.");
  }

  reserva.estado = "cancelada";
  reserva.canceladoEn = ahora.toISOString();
  await writeJSON(FILE, reservas);
  return reserva;
}

const getBySocio = async (socioId) => {
  const reservas = await getAll();
  return reservas.filter(r => r.socioId === Number(socioId));
};

module.exports = { getAll, crear, cancelar, getDisponibilidad, getBySocio };
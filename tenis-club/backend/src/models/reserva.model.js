const { readJSON, writeJSON } = require("../utils/fileStore");
const Socio = require("./socio.model");
const Pista = require("./pista.model");
const Config = require("./config.model");

const FILE = "reservas.json";

/* =========================
   UTILIDADES DE FECHA/HORA
========================= */

function combinarFechaHora(fecha, hora) {
  // fecha: "YYYY-MM-DD", hora: "HH:00"
  return new Date(`${fecha}T${hora}:00`);
}

// Calcula el fin del bloque (duración 1 hora)
function horaFinBloque(fecha, hora) {
  const inicio = combinarFechaHora(fecha, hora);
  const fin = new Date(inicio);
  fin.setHours(fin.getHours() + 1);
  return fin;
}

function esMismoDia(fechaA, fechaB) {
  return fechaA.toDateString() === fechaB.toDateString();
}

// Ahora considera el FIN del bloque
function estaFinalizada(fecha, hora) {
  return horaFinBloque(fecha, hora) < new Date();
}

/* =========================
   AUTO-CIERRE DE RESERVAS
========================= */

// Marca como "no_ocupada" las reservas que ya terminaron
// y nunca registraron uso
async function autoCerrarNoOcupadas(reservas) {
  const ahora = new Date();
  let cambiaron = false;

  reservas.forEach(r => {
    if (r.estado === "activa" && r.uso === null) {
      if (horaFinBloque(r.fecha, r.hora) <= ahora) {
        r.uso = "no_ocupada";
        cambiaron = true;
      }
    }
  });

  if (cambiaron) {
    await writeJSON(FILE, reservas);
  }

  return reservas;
}

/* =========================
   GET ALL (MODIFICADO)
========================= */

const getAll = async () => {
  const reservas = await readJSON(FILE);
  return autoCerrarNoOcupadas(reservas);
};

/* =========================
   CASOS DE USO
========================= */

// SO01 — Disponibilidad de una pista en una fecha dada
async function getDisponibilidad(pistaId, fecha) {
  const pistas = await Pista.getAll();
  const pista = pistas.find(p => p.id === Number(pistaId));
  if (!pista) throw new Error("Pista no encontrada.");

  const reservas = await getAll();
  const ocupadas = reservas
    .filter(r =>
      r.pistaId === Number(pistaId) &&
      r.fecha === fecha &&
      r.estado === "activa"
    )
    .map(r => r.hora);

  return ocupadas;
}

// AD07 — Registrar si la pista reservada fue ocupada o no
async function registrarUso(id, uso) {
  if (!["usada", "no_ocupada"].includes(uso)) {
    throw new Error("El valor de 'uso' debe ser 'usada' o 'no_ocupada'.");
  }

  const reservas = await getAll(); // ya incluye el auto-cierre de bloques vencidos
  const reserva = reservas.find(r => r.id === id);
  if (!reserva) throw new Error("Reserva no encontrada.");
  if (reserva.estado !== "activa") {
    throw new Error("Solo se puede registrar el uso de reservas activas (no canceladas).");
  }
  if (reserva.uso !== null) {
    throw new Error("El uso de esta reserva ya fue registrado (puede haberse cerrado automáticamente al vencer el bloque).");
  }

  const inicio = combinarFechaHora(reserva.fecha, reserva.hora);
  const ahora = new Date();
  if (ahora < inicio) {
    throw new Error(`Aún no se puede marcar el uso de esta reserva. El bloque empieza a las ${reserva.hora}.`);
  }

  reserva.uso = uso;
  await writeJSON(FILE, reservas);
  return reserva;
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

  // Fecha/hora válida
  const fechaHoraReserva = combinarFechaHora(fecha, hora);
  if (isNaN(fechaHoraReserva.getTime())) {
    throw new Error("Fecha u hora inválida.");
  }

  const ahora = new Date();

  // No reservar en el pasado
  if (fechaHoraReserva < ahora) {
    throw new Error("No se puede reservar en una fecha u hora que ya pasó.");
  }

  // Máximo 1 mes de anticipación
  const unMesDespues = new Date(ahora);
  unMesDespues.setMonth(unMesDespues.getMonth() + 1);

  if (fechaHoraReserva > unMesDespues) {
    throw new Error("No se pueden hacer reservas para más de un mes de anticipación.");
  }

  // Verificar disponibilidad
  const reservas = await getAll();
  const ocupado = reservas.some(r =>
    r.pistaId === Number(pistaId) &&
    r.fecha === fecha &&
    r.hora === hora &&
    r.estado === "activa"
  );

  if (ocupado) {
    throw new Error("Ese bloque horario ya está reservado para esta pista.");
  }

  const nueva = {
    id: Date.now(),
    socioId: Number(socioId),
    pistaId: Number(pistaId),
    fecha,
    hora,
    estado: "activa",
    uso: null,
    creadoEn: ahora.toISOString(),
    canceladoEn: null,
  };

  reservas.push(nueva);
  await writeJSON(FILE, reservas);

  return nueva;
}

// SO03 — Cancelar una reserva
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

  // Calcular y guardar penalización (base para facturación)
  const config = await Config.getConfig();
  const importeNormal = config.precioActual * 1; // duración fija 1h
  reserva.penalizacion = Math.max(importeNormal, config.tarifaCastigo);

  reserva.estado = "cancelada";
  reserva.canceladoEn = ahora.toISOString();
  await writeJSON(FILE, reservas);
  return reserva;
}

// Obtener reservas por socio
const getBySocio = async (socioId) => {
  const reservas = await getAll();
  return reservas.filter(r => r.socioId === Number(socioId));
};

/*=========================
  CONSULTAS PARA FACTURACIÓN
=========================*/
function obtenerMesAnio(fechaStr) {
  const [y, m] = fechaStr.split("-").map(Number);
  return { mes: m, anio: y };
}

async function getBySocioYPeriodo(socioId, mes, anio) {
  const reservas = await getAll();
  return reservas.filter(r => {
    if (r.socioId !== Number(socioId)) return false;
    const { mes: m, anio: a } = obtenerMesAnio(r.fecha);
    return m === Number(mes) && a === Number(anio);
  });
}

async function getUsadasPorSocioYPeriodo(socioId, mes, anio) {
  const todas = await getBySocioYPeriodo(socioId, mes, anio);
  return todas.filter(r => r.estado === "activa" && r.uso === "usada");
}

async function getPenalizablesPorSocioYPeriodo(socioId, mes, anio) {
  const todas = await getBySocioYPeriodo(socioId, mes, anio);
  return todas.filter(r =>
    r.estado === "cancelada" || (r.estado === "activa" && r.uso === "no_ocupada")
  );
}

module.exports = {
  getAll,
  crear,
  cancelar,
  getDisponibilidad,
  getBySocio,
  registrarUso,
  getBySocioYPeriodo,
  getUsadasPorSocioYPeriodo,
  getPenalizablesPorSocioYPeriodo
};
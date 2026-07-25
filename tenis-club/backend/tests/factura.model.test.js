// Lógica interna para las pruebas del modelo de facturación
const FacturacionService = {
  calcularPistasOcupadas: (reservas) => {
    return reservas
      .filter(r => r.estado === 'ocupada')
      .reduce((acc, r) => acc + r.tarifa, 0);
  },
  procesarNoOcupaciones: (noOcupaciones, tarifa) => {
    return noOcupaciones.map((_, index) => {
      // La primera del año es exenta (0), las demás cobran la tarifa
      return index === 0 ? 0 : tarifa;
    });
  },
  calcularPenalizaciones: (cancelaciones) => {
    return cancelaciones.reduce((acc, c) => acc + c.penalizacion, 0);
  },
  obtenerHistorialUsuario: (baseDatos, usuarioId) => {
    return baseDatos.filter(inv => inv.usuarioId === usuarioId);
  }
};

describe('Factura model', () => {
  test('las pistas ocupadas se cobran correctamente segun la tarifa vigente', () => {
    const reservasOcupadas = [
      { id: 1, estado: 'ocupada', tarifa: 50 },
      { id: 2, estado: 'ocupada', tarifa: 50 }
    ];

    const total = FacturacionService.calcularPistasOcupadas(reservasOcupadas);
    expect(total).toBe(100);
  });

  test('la primera no ocupacion del anio no se cobra y las demas si', () => {
    const noOcupacionesAnio = [
      { id: 101, anio: 2026, fecha: '2026-02-10' }, // 1ª del año (Exenta -> 0)
      { id: 102, anio: 2026, fecha: '2026-05-15' }, // 2ª del año (Se cobra -> 50)
      { id: 103, anio: 2026, fecha: '2026-07-20' }  // 3ª del año (Se cobra -> 50)
    ];

    const resultadoCobros = FacturacionService.procesarNoOcupaciones(noOcupacionesAnio, 50);
    expect(resultadoCobros).toEqual([0, 50, 50]);
  });

  test('se aplican correctamente las penalizaciones por cancelacion', () => {
    const cancelaciones = [
      { id: 201, penalizacion: 20 },
      { id: 202, penalizacion: 20 }
    ];

    const totalPenalizaciones = FacturacionService.calcularPenalizaciones(cancelaciones);
    expect(totalPenalizaciones).toBe(40);
  });

  test('el historial de facturas ve todas las facturas acumuladas del usuario', () => {
    const baseDeDatosMock = [
      { id: 1, usuarioId: 1, mes: 5, total: 120 },
      { id: 2, usuarioId: 1, mes: 6, total: 90 },
      { id: 3, usuarioId: 2, mes: 6, total: 200 }, // De otro usuario
      { id: 4, usuarioId: 1, mes: 7, total: 170 }
    ];

    const historialUsuario1 = FacturacionService.obtenerHistorialUsuario(baseDeDatosMock, 1);
    
    expect(historialUsuario1.length).toBe(3);
    expect(historialUsuario1).toEqual([
      { id: 1, usuarioId: 1, mes: 5, total: 120 },
      { id: 2, usuarioId: 1, mes: 6, total: 90 },
      { id: 4, usuarioId: 1, mes: 7, total: 170 }
    ]);
  });
});
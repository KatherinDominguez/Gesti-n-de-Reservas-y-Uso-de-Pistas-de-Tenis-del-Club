const Reserva = require("../src/models/reserva.model");
const { readJSON, writeJSON } = require("../src/utils/fileStore");
const Socio = require("../src/models/socio.model");
const Pista = require("../src/models/pista.model");

jest.mock("../src/utils/fileStore");
jest.mock("../src/models/socio.model");
jest.mock("../src/models/pista.model");

describe("Modelo Reserva", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("SO02 - Crear reservas", () => {

        test("Debe crear correctamente una reserva válida", async () => {

            Socio.getAll.mockResolvedValue([
                { id: 1, activo: true }
            ]);

            Pista.getAll.mockResolvedValue([
                { id: 1 }
            ]);

            readJSON.mockResolvedValue([]);

            const reserva = await Reserva.crear({
                socioId: 1,
                pistaId: 1,
                fecha: "2026-08-10",
                hora: "15:00"
            });

            expect(reserva.estado).toBe("activa");
            expect(reserva.uso).toBeNull();
            expect(writeJSON).toHaveBeenCalled();
        });

        test("Debe impedir crear una reserva con un socio inexistente", async () => {

            Socio.getAll.mockResolvedValue([]);

            await expect(
                Reserva.crear({
                    socioId: 1,
                    pistaId: 1,
                    fecha: "2026-08-10",
                    hora: "15:00"
                })
            ).rejects.toThrow("Socio no encontrado.");
        });

        test("Debe impedir crear una reserva para una pista inexistente", async () => {

            Socio.getAll.mockResolvedValue([
                { id: 1, activo: true }
            ]);

            Pista.getAll.mockResolvedValue([]);

            await expect(
                Reserva.crear({
                    socioId: 1,
                    pistaId: 1,
                    fecha: "2026-08-10",
                    hora: "15:00"
                })
            ).rejects.toThrow("Pista no encontrada.");
        });

        test("Debe impedir reservar un bloque horario que ya está ocupado", async () => {

            Socio.getAll.mockResolvedValue([
                { id: 1, activo: true }
            ]);

            Pista.getAll.mockResolvedValue([
                { id: 1 }
            ]);

            readJSON.mockResolvedValue([
                {
                    id: 10,
                    pistaId: 1,
                    fecha: "2026-08-10",
                    hora: "15:00",
                    estado: "activa",
                    uso: null
                }
            ]);

            await expect(
                Reserva.crear({
                    socioId: 1,
                    pistaId: 1,
                    fecha: "2026-08-10",
                    hora: "15:00"
                })
            ).rejects.toThrow("Ese bloque horario ya está reservado");
        });

    });

    describe("SO03 - Cancelar reservas", () => {

        test("Debe cancelar correctamente una reserva futura", async () => {

            readJSON.mockResolvedValue([
                {
                    id: 1,
                    estado: "activa",
                    fecha: "2026-08-10",
                    hora: "15:00",
                    uso: null
                }
            ]);

            const reserva = await Reserva.cancelar(1);

            expect(reserva.estado).toBe("cancelada");
            expect(writeJSON).toHaveBeenCalled();
        });

    });

});
// tests/socio.model.test.js
jest.mock("../src/utils/fileStore");
const { readJSON, writeJSON } = require("../src/utils/fileStore");
const Socio = require("../src/models/socio.model");

describe("Socio model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("no permite crear un socio con número duplicado", async () => {
    readJSON.mockResolvedValue([
      { id: 1, numeroSocio: "S001", nombre: "Ana", activo: true }
    ]);

    await expect(
      Socio.crear({ numeroSocio: "S001", nombre: "Otro" })
    ).rejects.toThrow("Ya existe un socio con ese número.");
  });

  test("no permite modificar un socio dado de baja", async () => {
    readJSON.mockResolvedValue([
      { id: 1, numeroSocio: "S001", nombre: "Ana", activo: false }
    ]);

    await expect(
      Socio.modificar(1, { nombre: "Ana Cambiada" })
    ).rejects.toThrow("No se puede modificar un socio dado de baja.");
  });

  test("dar de baja marca activo como false", async () => {
    readJSON.mockResolvedValue([
      { id: 1, numeroSocio: "S001", nombre: "Ana", activo: true }
    ]);
    writeJSON.mockResolvedValue();

    const socio = await Socio.darDeBaja(1);
    expect(socio.activo).toBe(false);
  });
});
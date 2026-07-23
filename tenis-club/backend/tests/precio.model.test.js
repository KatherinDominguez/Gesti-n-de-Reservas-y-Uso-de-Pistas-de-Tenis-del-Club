jest.mock("../src/utils/fileStore");
const { readJSON, writeJSON } = require("../src/utils/fileStore");
const Precio = require("../src/models/precio.model");

describe("Precio model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("actualiza el precio y registra el cambio en el historial", async () => {
    readJSON.mockResolvedValue({ actual: 40, historial: [] });
    writeJSON.mockResolvedValue();

    const data = await Precio.actualizarPrecio(45);

    expect(data.actual).toBe(45);
    expect(data.historial).toHaveLength(1);
    expect(data.historial[0]).toMatchObject({ anterior: 40, nuevo: 45 });
  });

  test("acumula correctamente el historial tras 3 modificaciones", async () => {
    let estado = { actual: 40, historial: [] };
    readJSON.mockImplementation(() => Promise.resolve(estado));
    writeJSON.mockImplementation((_, data) => {
      estado = data;
      return Promise.resolve();
    });

    await Precio.actualizarPrecio(42);
    await Precio.actualizarPrecio(45);
    await Precio.actualizarPrecio(50);

    expect(estado.actual).toBe(50);
    expect(estado.historial).toHaveLength(3);
  });
});
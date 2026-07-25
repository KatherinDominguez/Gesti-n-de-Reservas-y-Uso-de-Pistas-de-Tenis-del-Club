jest.mock("../src/utils/fileStore");
const { readJSON } = require("../src/utils/fileStore");
const Pista = require("../src/models/pista.model");

describe("Pista model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve exactamente 5 pistas precargadas", async () => {
    readJSON.mockResolvedValue([
      { id: 1, nombre: "Pista 1", superficie: "Tierra batida" },
      { id: 2, nombre: "Pista 2", superficie: "Tierra batida" },
      { id: 3, nombre: "Pista 3", superficie: "Dura" },
      { id: 4, nombre: "Pista 4", superficie: "Dura" },
      { id: 5, nombre: "Pista 5", superficie: "Césped" },
    ]);

    const pistas = await Pista.getAll();

    expect(pistas).toHaveLength(5);
    expect(pistas[0]).toHaveProperty("nombre");
    expect(pistas[0]).toHaveProperty("superficie");
  });

  test("no expone un método para crear pistas nuevas", () => {
    expect(Pista.crear).toBeUndefined();
  });
});
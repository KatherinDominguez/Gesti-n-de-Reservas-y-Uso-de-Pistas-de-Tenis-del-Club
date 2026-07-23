const { readJSON } = require("../utils/fileStore");
const getAll = () => readJSON("pistas.json");
module.exports = { getAll };
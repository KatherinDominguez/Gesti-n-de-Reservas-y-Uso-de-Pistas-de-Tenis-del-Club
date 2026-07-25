const fs = require("fs/promises");
const path = require("path");

function readJSON(file) {
  const filePath = path.join(__dirname, "..", "data", file);
  return fs.readFile(filePath, "utf-8").then(JSON.parse);
}

function writeJSON(file, data) {
  const filePath = path.join(__dirname, "..", "data", file);
  return fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readJSON, writeJSON };
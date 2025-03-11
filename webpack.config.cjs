const path = require("path");

module.exports = {
  mode: "production", // or 'development'
  entry: "./app.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
};

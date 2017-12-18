require("babel-register");

if (process.argv[2] === "installer") {
  require("./src/main-process/installer.js");
} else {
  require("./src/main-process/main.js");
}

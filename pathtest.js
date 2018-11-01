var path = require("path");
console.log(". = %s", path.resolve("."));
console.log("__dirname = %s", path.resolve(__dirname));
console.log("/static = %s", path.resolve(path.join(__dirname, 'public')));
console.log("/quizdata = %s", path.resolve(path.join(__dirname, 'public/quizdata/')));
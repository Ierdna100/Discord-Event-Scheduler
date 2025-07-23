import fs from "fs";

export default class Application {
    constructor() {
        if (!fs.existsSync("./logs")) {
            fs.mkdirSync("./logs");
        }
        if (!fs.existsSync("./env")) {
            fs.mkdirSync("./env");
        }
    }
}

new Application();

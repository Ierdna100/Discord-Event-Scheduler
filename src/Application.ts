import MongoManager from "./database/MongoManager.js";
import DiscordClient from "./discord/DiscordClient.js";
import { ANSICodes } from "./dto/ANSICodes.js";
import { EnvFileFields, EnvManager } from "./EnvManager.js";
import { Logger } from "./Logger.js";

export class Application {
    public static instance: Application;

    public env!: EnvFileFields;

    constructor() {
        Application.instance = this;

        const success = EnvManager.readAndParse();
        if (!success.success) {
            success.errors.forEach((e) => Logger.fatal(e));
            return;
        }
        Logger.initializeLevelsFromSettings();

        Logger.info("Initializing Discord bridge");
        new MongoManager().initialize();
        new DiscordClient().initialize();
    }
}

new Application();

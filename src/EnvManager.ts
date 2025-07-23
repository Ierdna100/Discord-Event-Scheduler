import fs from "fs";
import { ANSICodes } from "./dto/ANSICodes.js";
import path from "path";
import { Logger } from "./Logger.js";

const envFilepath = "./env/.env.json";

export class EnvManager {
    public static env: EnvFileFields;

    public static readAndParse(): { success: true } | { success: false; errors: string[] } {
        const errors: string[] = [];

        Logger.detail(`Using env file at ${path.resolve(envFilepath)}`);
        if (!fs.existsSync(envFilepath)) {
            fs.writeFileSync(envFilepath, JSON.stringify(new EnvFileFields(), null, "\t"));
            errors.push("Environnement file does not exist! Automatically created file, please fill it in!");
            return { success: false, errors: errors };
        }

        const envFileJSON = JSON.parse(fs.readFileSync(envFilepath).toString());

        let envFileFields = new EnvFileFields();

        const remainingFieldKeys: string[] = [];
        for (const key in envFileFields) {
            remainingFieldKeys.push(key);
        }

        for (const key in envFileJSON) {
            if (!remainingFieldKeys.includes(key)) {
                Logger.warn(
                    `Environnement variable with key '${key}' is not required by this software, it may be leftover from a previous version. You can safely remove it.`,
                    ANSICodes.ForeBlack,
                    ANSICodes.BackYellow
                );
                continue;
            }

            if (typeof envFileFields[key as keyof EnvFileFields] == "number") {
                const value = parseFloat(envFileJSON[key]);
                if (Number.isNaN(value)) {
                    errors.push(`Environnement variable with key '${key}' was expected to be a number, but parsing it returned NaN!`);
                    continue;
                }
                (envFileFields[key as keyof EnvFileFields] as number) = value;
            } else if (typeof envFileFields[key as keyof EnvFileFields] == "string") {
                const value = (envFileJSON[key] as string).trim();
                if (value == "") {
                    errors.push(`Environnement variable with key '${key}' was expected to be a string, but it is empty!`);
                    continue;
                }
                (envFileFields[key as keyof EnvFileFields] as string) = value;
            } else if (typeof envFileFields[key as keyof EnvFileFields] == "boolean") {
                const value = envFileJSON[key] as boolean;
                (envFileFields[key as keyof EnvFileFields] as boolean) = value;
            }

            remainingFieldKeys.splice(remainingFieldKeys.indexOf(key), 1);
        }

        if (remainingFieldKeys.length != 0) {
            errors.push(`Environnement variable with key '${remainingFieldKeys[0]}' not set to a value! Please fill out the .env file!`);
        }

        if (errors.length != 0) {
            return { success: false, errors: errors };
        }

        EnvManager.env = envFileFields;
        return { success: true };
    }
}

export class EnvFileFields {
    mongoConnectionString = "mongodb://localhost:27017";
    mongoDatabaseName = "minecraft";

    token = "";
    clientId = "";

    logDetails = true;
    logTimestamps = true;

    httpPort = 8000;

    websocketPort = 7500;
    websocketPassword = crypto.randomUUID();

    coll_serverData = "serverData";
    coll_messages = "messages";
    coll_deaths = "deaths";
    coll_starts = "serverStarts";
    coll_stops = "serverStops";
    coll_disconnects = "playerDisconnects";
    coll_connects = "playerConnects";
    coll_advancements = "advancements";
    coll_overloads = "overloads";
    coll_allowedMembers = "allowedMembers";
    coll_awaitingMembers = "awaitingMembers";
    coll_bannedIps = "ipBans";
    coll_confirmingIps = "ipConfirms";

    publicBroadcastChannelId = "";
    privateBroadcastChannelId = "";
    authenticationRequestsChannelId = "";

    authenticationRequestsPingRoleId = "";
    autoAuthenticateRoleId = "";

    backupTimeHours = 2400;

    constructor() {}
}

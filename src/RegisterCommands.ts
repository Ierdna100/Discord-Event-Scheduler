import { REST, Routes } from "discord.js";
import fs from "fs";
import { EnvManager } from "./EnvManager.js";
import { slashComamnds } from "./discord/InteractionHandlers.js";

async function refreshCommands() {
    EnvManager.readAndParse();

    const rest = new REST().setToken(EnvManager.env.token || "");

    console.log("Refreshing commands");

    let commands = [];

    for (const command of slashComamnds) {
        commands.push(command.commandBuilder);
        console.log(`Found command '${command.commandBuilder.name}': '${command.commandBuilder.description}'`);
    }

    await rest.put(Routes.applicationCommands(EnvManager.env.clientId || ""), { body: commands });

    console.log("Finished refreshing commands");
}

refreshCommands();

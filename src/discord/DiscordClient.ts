import { CacheType, Client, IntentsBitField, Interaction, MessageCreateOptions, MessagePayload, TextChannel, UserResolvable } from "discord.js";
import { buttons, slashComamnds } from "./InteractionHandlers.js";
import { ANSICodes } from "../dto/ANSICodes.js";
import { buttonIdSeparator } from "./buttons/ButtonBase.js";
import { ObjectId } from "mongodb";
import { Logger } from "../Logger.js";
import { EnvManager } from "../EnvManager.js";

export default class DiscordClient {
    public static instance: DiscordClient;

    public client: Client;

    public publicBroadcastChannel: TextChannel;
    public privateBroadcastChannel: TextChannel;

    public authenticationRequestsChannel: TextChannel;

    public ready = false;

    constructor() {
        DiscordClient.instance = this;
    }

    public static async trySendMessageToUser(userId: UserResolvable, message: string | MessagePayload | MessageCreateOptions): Promise<boolean> {
        try {
            await DiscordClient.instance.client.users.send(userId, message);
        } catch (ignored) {
            return false;
        }

        return true;
    }

    public async initialize() {
        this.client = new Client({ intents: IntentsBitField.Flags.Guilds | IntentsBitField.Flags.DirectMessages });

        Logger.info("Initializing Discord client...", ANSICodes.ForeCyan);

        this.client.on("ready", () => this.onReady());
        this.client.on("interactionCreate", (interaction) => this.onInteractionCreate(interaction));
        this.client.on("error", (error) => this.onError(error));

        await this.client.login(EnvManager.env.token);
    }

    public async onReady() {
        this.ready = true;

        this.publicBroadcastChannel = await this.verifyChannel(EnvManager.env.publicBroadcastChannelId, "the public broadcasting channel");
        this.privateBroadcastChannel = await this.verifyChannel(EnvManager.env.privateBroadcastChannelId, "the private broadcasting channel");
        this.authenticationRequestsChannel = await this.verifyChannel(EnvManager.env.authenticationRequestsChannelId, "the authentication requests channel");

        Logger.info("Discord client ready!", ANSICodes.ForeGreen);
    }

    private async verifyChannel(channelId: string, channelName: string): Promise<TextChannel> {
        const channel = await this.client.channels.fetch(channelId);
        if (channel == null) {
            throw new Error(`Channel with ID ${EnvManager.env.privateBroadcastChannelId} cannot be used as ${channelName} as it does not exist!`);
        } else if (!(channel instanceof TextChannel)) {
            throw new Error(`Channel with ID ${EnvManager.env.privateBroadcastChannelId} cannot be used as ${channelName} as it is not a text channel!`);
        }

        return channel;
    }

    public async onInteractionCreate(interaction: Interaction<CacheType>) {
        if (!this.ready) {
            return;
        }

        const userId = interaction.user.id;
        if (interaction.isChatInputCommand()) {
            Logger.info(`User with ID ${userId} ran slash command '${interaction.commandName}'`);
            const options = interaction.options;

            for (const command of slashComamnds) {
                if (command.commandBuilder.name == interaction.commandName) {
                    interaction.reply(await command.reply(interaction, userId, options));
                    return;
                }
            }
        } else if (interaction.isButton()) {
            const [relatedDatabaseObjectId, customButtonId] = interaction.customId.split(buttonIdSeparator);
            Logger.detail("Button received!");
            Logger.detail(`${relatedDatabaseObjectId} ${customButtonId}`);
            for (const button of buttons) {
                Logger.detail(button.customButtonId);
                if (button.customButtonId == customButtonId) {
                    Logger.detail("Button matched!");
                    interaction.update(await button.onInteract(interaction, new ObjectId(relatedDatabaseObjectId), userId));
                    return;
                }
            }
        }
    }

    public async onError(error: Error) {
        Logger.fatal(error.stack || "-- NO STACK TRACE --");
    }
}

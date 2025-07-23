import {
    SlashCommandBuilder,
    CacheType,
    ChatInputCommandInteraction,
    CommandInteractionOptionResolver,
    InteractionReplyOptions,
    EmbedBuilder
} from "discord.js";
import { EmbedColors } from "../../dto/EmbedColors.js";

export type CommandInteraction = ChatInputCommandInteraction<CacheType>;
export type CommandOptions = Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">;

export default abstract class SlashCommandBase {
    abstract commandBuilder: Pick<SlashCommandBuilder, "name" | "description" | "toJSON">;

    abstract reply(interaction: CommandInteraction, userId: string, options: CommandOptions): Promise<InteractionReplyOptions>;

    protected success(message: string): InteractionReplyOptions;
    protected success(message: string, title: string): InteractionReplyOptions;
    protected success(message: string, title: string, onlyEmbed: true): EmbedBuilder;
    protected success(message: string, title = "Success!", onlyEmbed = false): InteractionReplyOptions | EmbedBuilder {
        const embedBuilder = new EmbedBuilder().setTitle(title).setDescription(message).setColor(EmbedColors.green).setTimestamp(new Date());
        if (onlyEmbed) {
            return embedBuilder;
        }

        return { embeds: [embedBuilder] };
    }

    protected failure(message: string): InteractionReplyOptions;
    protected failure(message: string, title: string): InteractionReplyOptions;
    protected failure(message: string, title: string, onlyEmbed: true): EmbedBuilder;
    protected failure(message: string, title = "Something went wrong!", onlyEmbed = false): InteractionReplyOptions | EmbedBuilder {
        const embedBuilder = new EmbedBuilder().setTitle(title).setDescription(message).setColor(EmbedColors.red).setTimestamp(new Date());
        if (onlyEmbed) {
            return embedBuilder;
        }

        return { embeds: [embedBuilder] };
    }

    protected awaiting(message: string): InteractionReplyOptions;
    protected awaiting(message: string, title: string): InteractionReplyOptions;
    protected awaiting(message: string, title: string, onlyEmbed: true): EmbedBuilder;
    protected awaiting(message: string, title = "Processing Your Request...", onlyEmbed = false): InteractionReplyOptions | EmbedBuilder {
        const embedBuilder = new EmbedBuilder().setTitle(title).setDescription(message).setColor(EmbedColors.yellow).setTimestamp(new Date());
        if (onlyEmbed) {
            return embedBuilder;
        }

        return { embeds: [embedBuilder] };
    }
}

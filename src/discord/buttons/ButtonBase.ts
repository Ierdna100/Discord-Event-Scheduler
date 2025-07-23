import { ButtonBuilder, ButtonInteraction, CacheType, InteractionReplyOptions, InteractionUpdateOptions } from "discord.js";
import { ObjectId } from "mongodb";

export const buttonIdSeparator = "|";

export default abstract class ButtonFactoryBase {
    abstract customButtonId: string;
    abstract buttonBuilder: ButtonBuilder;

    public build(relatedObjectId: string): ButtonBuilder {
        this.buttonBuilder.setCustomId(`${relatedObjectId}${buttonIdSeparator}${this.customButtonId}`);
        return this.buttonBuilder;
    }

    public abstract onInteract(interaction: ButtonInteraction<CacheType>, relatedObjectId: ObjectId, executorId: string): Promise<InteractionUpdateOptions>;
}

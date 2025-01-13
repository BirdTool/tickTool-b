import { log } from "#settings";
import ck from "chalk";
import { ApplicationCommandType, Collection } from "discord.js";
import { isPromise } from "node:util/types";
export class Command {
    data;
    static handlers = new Collection();
    static commands = new Collection();
    constructor(data) {
        this.data = data;
        data.dmPermission ??= false;
        data.type ??= ApplicationCommandType.ChatInput;
        Command.commands.set(data.name, data);
        Command.handlers.set(data.name, {
            run: data.run,
            autocomplete: "autocomplete" in data
                ? data.autocomplete : undefined
        });
    }
    static async register(options) {
        const { addMessage, client, guilds, defaultMemberPermissions } = options;
        if (defaultMemberPermissions) {
            Command.commands.forEach(command => command.defaultMemberPermissions ??= defaultMemberPermissions);
        }
        const plural = (value) => value > 1 ? "s" : "";
        if (guilds?.size) {
            const [globalCommands, guildCommads] = Command.commands.partition(c => c.global === true);
            await client.application.commands.set(Array.from(globalCommands.values()))
                .then(({ size }) => Boolean(size) &&
                addMessage(`⤿ ${size} command${plural(size)} successfully registered globally!`));
            for (const guild of guilds.values()) {
                await guild.commands.set(Array.from(guildCommads.values()))
                    .then(({ size }) => addMessage(`⤿ ${size} command${plural(size)} registered in ${ck.underline(guild.name)} guild successfully!`));
            }
            Command.commands.clear();
            return;
        }
        for (const guild of client.guilds.cache.values()) {
            guild.commands.set([]);
        }
        await client.application.commands.set(Array.from(Command.commands.values()))
            .then(({ size }) => addMessage(`⤿ ${size} command${plural(size)} successfully registered globally!`));
        Command.commands.clear();
    }
    static onCommand(interaction, onError) {
        const command = Command.handlers.get(interaction.commandName);
        if (!command)
            return;
        try {
            const execution = command.run(interaction);
            if (isPromise(execution) && onError) {
                execution.catch(error => onError(error, interaction));
            }
        }
        catch (error) {
            if (onError)
                onError(error, interaction);
            else
                throw error;
        }
    }
    static onAutocomplete(interaction) {
        const command = Command.handlers.get(interaction.commandName);
        if (!command || !command.autocomplete)
            return;
        command.autocomplete(interaction);
    }
    static loadLogs() {
        for (const [name] of Command.commands) {
            log.success(ck.green(`{/} ${ck.blue.underline(name)} command loaded!`));
        }
    }
}

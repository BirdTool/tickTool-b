import { baseStorage } from "./base.storage.js";
import ck from "chalk";
import { log } from "#settings";
import { brBuilder } from "@magicyan/discord";
export async function baseCommandHandler(interaction) {
    const { onNotFound, middleware, onError } = baseStorage.config.commands;
    const command = baseStorage.commands.get(interaction.commandName);
    if (!command) {
        onNotFound && onNotFound(interaction);
        return;
    }
    ;
    try {
        let block = false;
        if (middleware)
            await middleware(interaction, () => block = true);
        if (block)
            return;
        const execution = command.run(interaction);
        if (execution instanceof Promise && onError) {
            execution.catch(error => onError(error, interaction));
        }
    }
    catch (error) {
        if (onError) {
            onError(error, interaction);
        }
        else {
            throw error;
        }
        ;
    }
}
export async function baseAutocompleteHandler(interaction) {
    const command = baseStorage.commands.get(interaction.commandName);
    if (command && "autocomplete" in command && command.autocomplete) {
        command.autocomplete(interaction);
    }
    ;
}
export async function baseRegisterCommands(client) {
    const plural = (value) => value > 1 ? "s" : "";
    const guilds = client.guilds.cache.filter(({ id }) => baseStorage.config.commands.guilds.includes(id));
    const messages = [];
    if (guilds?.size) {
        const [globalCommands, guildCommands] = baseStorage.commands
            .partition(c => c.global === true)
            .map(c => Array.from(c.values()));
        await client.application.commands.set(globalCommands)
            .then(({ size }) => Boolean(size) &&
            messages.push(ck.yellow(`⤿ ${size} command${plural(size)} successfully registered globally!`)));
        for (const guild of guilds.values()) {
            await guild.commands.set(guildCommands)
                .then(({ size }) => Boolean(size) &&
                messages.push(ck.yellow(`⤿ ${size} command${plural(size)} registered in ${ck.underline(guild.name)} guild successfully!`)));
        }
        log.log(brBuilder(messages));
        return;
    }
    for (const guild of client.guilds.cache.values()) {
        guild.commands.set([]);
    }
    const commands = Array.from(baseStorage.commands.values());
    await client.application.commands.set(commands)
        .then(({ size }) => messages.push(ck.yellow(`⤿ ${size} command${plural(size)} successfully registered globally!`)));
    log.log(brBuilder(messages));
}
export function baseCommandLog(data) {
    baseStorage.loadLogs.commands
        .push(ck.hex("#ff76a8")(`{/} ${ck.white.underline(data.name)} command loaded!`));
}
;

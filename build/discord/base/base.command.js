import { log } from "#settings";
import { brBuilder } from "@magicyan/discord";
import ck from "chalk";
import { baseStorage } from "./base.storage.js";
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
            .then(commands => {
            if (!commands.size)
                return;
            messages.push(ck.greenBright(`⤿ ${commands.size} command${plural(commands.size)} successfully registered globally!`));
            if (baseStorage.config.commands.verbose) {
                messages.push(...verbooseLogs(commands));
            }
        });
        for (const guild of guilds.values()) {
            await guild.commands.set(guildCommands)
                .then(commands => {
                messages.push(ck.greenBright(`⤿ ${commands.size} command${plural(commands.size)} registered in ${ck.underline(guild.name)} guild successfully!`));
                if (baseStorage.config.commands.verbose) {
                    messages.push(...verbooseLogs(commands));
                }
            });
        }
        log.log(brBuilder(messages));
        return;
    }
    for (const guild of client.guilds.cache.values()) {
        guild.commands.set([]);
    }
    const commands = Array.from(baseStorage.commands.values());
    await client.application.commands.set(commands)
        .then(commands => {
        messages.push(ck.greenBright(`⤿ ${commands.size} command${plural(commands.size)} successfully registered globally!`));
        if (baseStorage.config.commands.verbose) {
            messages.push(...verbooseLogs(commands));
        }
    });
    log.log(brBuilder(messages));
}
function verbooseLogs(commands) {
    const u = ck.underline;
    return commands.map(({ id, name, client, createdAt, guild }) => ck.dim.green([
        "{/}", u.blue(name),
        `(${id}) registerd in`,
        guild
            ? `${u.blue(guild.name)} guild`
            : `${u.blue(client.user.username)} application`,
        "at",
        u.greenBright(createdAt.toLocaleTimeString()),
    ].join(" ")));
}
export function baseCommandLog(data) {
    baseStorage.loadLogs.commands
        .push(ck.green(`{/} ${ck.blue.underline(data.name)} command loaded!`));
}
;

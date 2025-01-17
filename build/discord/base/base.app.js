import { baseErrorHandler, log } from "#settings";
import { CustomItents, CustomPartials } from "@magicyan/discord";
import { Client, version as djsVersion } from "discord.js";
import { baseAutocompleteHandler, baseCommandHandler, baseRegisterCommands } from "./base.command.js";
import { baseRegisterEvents } from "./base.event.js";
import { baseResponderHandler } from "./base.responder.js";
import { baseStorage } from "./base.storage.js";
import glob from "fast-glob";
import ck from "chalk";
export async function bootstrap(options) {
    const client = createClient(process.env.BOT_TOKEN, options);
    options.beforeLoad?.(client);
    await loadModules(options.meta.dirname, options.directories);
    if (options.loadLogs ?? true) {
        loadLogs();
    }
    console.log();
    log.info("📦", `${ck.hex("#5865F2").underline("discord.js")} ${ck.dim(djsVersion)}`, "/", `${ck.hex("#68a063").underline("NodeJs")} ${ck.dim(process.versions.node)}`);
    baseRegisterEvents(client);
    client.login();
    return { client };
}
async function loadModules(workdir, directories = []) {
    const pattern = "**/*.{js,ts,jsx,tsx}";
    const files = await glob([
        `!./discord/index.*`,
        `!./discord/base/**/*`,
        `./discord/${pattern}`,
        directories.map(path => `./${path.replaceAll("\\", "/")}/${pattern}`)
    ].flat(), { absolute: true, cwd: workdir });
    await Promise.all(files.map(path => {
        return import(`file://${path}`);
    }));
}
function createClient(token, options) {
    const client = new Client(Object.assign(options, {
        intents: options.intents ?? CustomItents.All,
        partials: options.partials ?? CustomPartials.All,
        failIfNotExists: options.failIfNotExists ?? false
    }));
    client.token = token;
    client.on("ready", async (client) => {
        await client.guilds.fetch().catch(() => null);
        log.log(ck.hex("#ff76a8")(`➝ Online as ${ck.hex("#ffbbf6").underline(client.user.username)}`));
        await baseRegisterCommands(client);
        process.on("uncaughtException", err => baseErrorHandler(err, client));
        process.on("unhandledRejection", err => baseErrorHandler(err, client));
        options.whenReady?.(client);
    });
    client.on("interactionCreate", async (interaction) => {
        switch (true) {
            case interaction.isAutocomplete(): {
                baseAutocompleteHandler(interaction);
                return;
            }
            case interaction.isCommand(): {
                baseCommandHandler(interaction);
                return;
            }
            default:
                baseResponderHandler(interaction);
                return;
        }
    });
    return client;
}
function loadLogs() {
    const logs = [
        baseStorage.loadLogs.commands,
        baseStorage.loadLogs.responders,
        baseStorage.loadLogs.events,
    ].flat();
    logs.forEach(text => log.success(text));
}

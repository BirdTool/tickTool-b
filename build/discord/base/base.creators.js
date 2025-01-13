import { ApplicationCommandType, Collection } from "discord.js";
import { addRoute } from "rou3";
import { baseCommandLog } from "./base.command.js";
import { baseEventLog } from "./base.event.js";
import { baseResponderLog } from "./base.responder.js";
import { baseStorage } from "./base.storage.js";
export function setupCreators(options = {}) {
    /** @commands */
    baseStorage.config.commands.guilds = options.commands?.guilds ?? [];
    baseStorage.config.commands.middleware = options.commands?.middleware;
    baseStorage.config.commands.onNotFound = options.commands?.onNotFound;
    baseStorage.config.commands.onError = options.commands?.onError;
    /** @responders  */
    baseStorage.config.responders.middleware = options.responders?.middleware;
    baseStorage.config.responders.onNotFound = options.responders?.onNotFound;
    baseStorage.config.responders.onError = options.responders?.onError;
    /** @logs */
    return {
        createCommand: function (data) {
            /** @defaults */
            data.type ??= ApplicationCommandType.ChatInput;
            data.dmPermission ??= false;
            data.defaultMemberPermissions ??= options.commands?.defaultMemberPermissions;
            /** @store */
            baseStorage.commands.set(data.name, data);
            baseCommandLog(data);
            return data;
        },
        createEvent: function (data) {
            /** @store */
            const events = baseStorage.events.get(data.event) ?? new Collection();
            events.set(data.name, data);
            baseStorage.events.set(data.event, events);
            baseEventLog(data);
            return data;
        },
        createResponder: function (data) {
            /** @store */
            const { customId } = data;
            const types = Array.from(new Set(data.types).values());
            for (const type of types) {
                addRoute(baseStorage.responders, type, customId, data);
                baseResponderLog(customId, type);
            }
            ;
            return data;
        },
    };
}

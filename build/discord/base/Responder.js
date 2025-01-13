import { createRouter } from "radix3";
import { spaceBuilder } from "@magicyan/discord";
import ck from "chalk";
import { isPromise } from "node:util/types";
import { log } from "#settings";
export var ResponderType;
(function (ResponderType) {
    ResponderType["Button"] = "Button";
    ResponderType["Select"] = "Select menu";
    ResponderType["StringSelect"] = "String select menu";
    ResponderType["UserSelect"] = "User select menu";
    ResponderType["RoleSelect"] = "Role select menu";
    ResponderType["ChannelSelect"] = "Channel select menu";
    ResponderType["MentionableSelect"] = "Mentionable select menu";
    ResponderType["Row"] = "Row";
    ResponderType["Modal"] = "Modal";
    ResponderType["ModalComponent"] = "Modal component";
    ResponderType["All"] = "Component or modal";
})(ResponderType || (ResponderType = {}));
export class Responder {
    static routers = new Map;
    static logs = new Map();
    constructor(data) {
        const router = Responder.routers.get(data.type) ?? createRouter();
        router.insert(data.customId, data);
        Responder.routers.set(data.type, router);
        const log = Responder.logs.get(data.type) ?? new Set();
        log.add(data.customId);
        Responder.logs.set(data.type, log);
    }
    static getResponderType(interaction) {
        return interaction.isButton() ? ResponderType.Button :
            interaction.isStringSelectMenu() ? ResponderType.StringSelect :
                interaction.isChannelSelectMenu() ? ResponderType.ChannelSelect :
                    interaction.isRoleSelectMenu() ? ResponderType.RoleSelect :
                        interaction.isUserSelectMenu() ? ResponderType.UserSelect :
                            interaction.isMentionableSelectMenu() ? ResponderType.MentionableSelect :
                                interaction.isModalSubmit() && interaction.isFromMessage() ? ResponderType.ModalComponent :
                                    interaction.isModalSubmit() ? ResponderType.Modal : undefined;
    }
    static async onInteraction(interaction, onError) {
        const responderType = Responder.getResponderType(interaction);
        if (!responderType)
            return;
        const router = Responder.routers.get(responderType) ?? Responder.findRouter(responderType);
        if (!router) {
            Responder.options.onNotFound?.(interaction);
            return;
        }
        ;
        const handler = Responder.findHandler(router, responderType, interaction.customId);
        if (!handler || !handler.run) {
            Responder.options.onNotFound?.(interaction);
            return;
        }
        if (handler.params) {
            if (handler.parse) {
                const params = handler.parse(handler.params, interaction);
                handler.params = isPromise(params) ? await params : params;
            }
        }
        else
            handler.params = {};
        try {
            const execution = handler.run(interaction, handler.params);
            if (isPromise(execution) && onError) {
                execution.catch(error => onError(error, interaction, handler.params));
            }
        }
        catch (error) {
            if (onError)
                onError(error, interaction, handler.params);
            else
                throw error;
        }
    }
    static findHandler(router, type, customId) {
        if (!router)
            return null;
        const handler = router.lookup(customId);
        if (handler)
            return handler;
        switch (type) {
            case ResponderType.StringSelect:
            case ResponderType.ChannelSelect:
            case ResponderType.UserSelect:
            case ResponderType.MentionableSelect:
            case ResponderType.RoleSelect: {
                router = Responder.findRouter(type);
                type = ResponderType.Select;
                break;
            }
            case ResponderType.Select:
            case ResponderType.Button: {
                router = Responder.findRouter(type);
                type = ResponderType.Row;
                break;
            }
            case ResponderType.ModalComponent: {
                router = Responder.findRouter(type);
                type = ResponderType.Modal;
                break;
            }
            case ResponderType.Modal:
            case ResponderType.Row: {
                router = Responder.findRouter(type);
                type = ResponderType.All;
                break;
            }
            case ResponderType.All: return null;
        }
        return Responder.findHandler(router, type, customId);
    }
    static findRouter(type) {
        switch (type) {
            case ResponderType.StringSelect:
            case ResponderType.ChannelSelect:
            case ResponderType.UserSelect:
            case ResponderType.MentionableSelect:
            case ResponderType.RoleSelect:
                type = ResponderType.Select;
                break;
            case ResponderType.Select:
            case ResponderType.Button:
                type = ResponderType.Row;
                break;
            case ResponderType.ModalComponent:
                type = ResponderType.Modal;
                break;
            case ResponderType.Row:
            case ResponderType.Modal:
                type = ResponderType.All;
                break;
            case ResponderType.All:
                return undefined;
        }
        return Responder.routers.get(type) ?? Responder.findRouter(type);
    }
    static options = {};
    static setup(options) {
        Responder.options = options;
    }
    static loadLogs() {
        for (const [type, list] of Responder.logs.entries()) {
            for (const customId of list.values()) {
                const u = ck.underline;
                log.success(ck.green(spaceBuilder(u.greenBright(type), u.blue(customId), "responder loaded!")));
            }
        }
        Responder.logs.clear();
    }
}

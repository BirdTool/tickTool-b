/** DO NOT CHANGE THIS FILE */
import { Collection } from "discord.js";
import { createRouter } from "rou3";
export const baseStorage = {
    commands: new Collection(),
    events: new Collection(),
    responders: createRouter(),
    config: {
        commands: {
            guilds: []
        },
        responders: {}
    },
    loadLogs: {
        commands: [],
        responders: [],
        events: []
    }
};
/** DO NOT CHANGE THIS FILE */ 

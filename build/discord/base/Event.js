import { log } from "#settings";
import chalk from "chalk";
import { Collection } from "discord.js";
export class Event {
    static items = new Collection();
    constructor(data) {
        const events = Event.items.get(data.event) ?? new Collection();
        events.set(data.name, data);
        Event.items.set(data.event, events);
    }
    static register(client) {
        const eventHandlers = Event.items.map((collection, event) => ({
            event, handlers: collection.map(e => ({ run: e.run, once: e.once }))
        }));
        for (const { event, handlers } of eventHandlers) {
            client.on(event, (...args) => {
                for (const { run } of handlers.filter(e => !e.once))
                    run(...args);
            });
            client.once(event, (...args) => {
                for (const { run } of handlers.filter(e => e.once))
                    run(...args);
            });
        }
    }
    static loadLogs() {
        for (const events of Event.items.values()) {
            for (const { name } of events.values()) {
                log.success(chalk.green(`${chalk.yellow.underline(name)} event loaded!`));
            }
        }
    }
}

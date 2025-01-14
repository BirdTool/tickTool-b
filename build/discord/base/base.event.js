import { baseStorage } from "./base.storage.js";
import ck from "chalk";
export function baseRegisterEvents(client) {
    const eventHandlers = baseStorage.events.map((collection, event) => ({
        event, handlers: collection.map(e => ({ run: e.run, once: e.once }))
    }));
    for (const { event, handlers } of eventHandlers) {
        const onHandlers = handlers.filter(e => !e.once);
        const onceHandlers = handlers.filter(e => e.once);
        client.on(event, (...args) => {
            for (const { run } of onHandlers)
                run(...args);
        });
        client.once(event, (...args) => {
            for (const { run } of onceHandlers)
                run(...args);
        });
    }
}
export function baseEventLog(data) {
    baseStorage.loadLogs.events
        .push(ck.hex("#ff76a8")(`${ck.hex("#ff76a8").underline(`${data.event}`)} ${ck.white.underline(data.name)} event loaded!`));
}
;

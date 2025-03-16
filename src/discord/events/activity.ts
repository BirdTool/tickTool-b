import { createEvent } from "#base";
import { db } from "#database";
import chalk from "chalk";
import { ActivityType } from "discord.js";

createEvent({
    name: "acivitySet",
    event: "ready",
    async run(client) {
        const activity = await db.guilds.get<{ status: "online" | "idle" | "dnd" | "invisible"; type: string; text: string }>("status");
        if (activity === null) return
        if (activity.status) {
            try {
                client.user.setStatus(activity.status);
                console.log(chalk.green(`[ACTIVITY] Status set to ${activity.status}`));
            } catch (error) {
                console.error(`A error ocurred when setting status to ${activity.status}`, error);
            }
        }
        if (activity.type && activity.text) {
            try {
                let type: ActivityType;
                switch (activity.type) {
                    case "PLAYING":
                        type = ActivityType.Playing;
                        break;
                    case "LISTENING":
                        type = ActivityType.Listening;
                        break;
                    case "WATCHING":
                        type = ActivityType.Watching;
                        break;
                    case "COMPETING":
                        type = ActivityType.Competing;
                        break;
                    default:
                        type = ActivityType.Playing;
                }
                client.user.setActivity(activity.text, { type });
                console.log(chalk.green(`[ACTIVITY] Activity set to ${activity.text}`));
            } catch (error) {
                console.error(`A error ocurred when setting activity to ${activity.text}`, error);
            }
        }
    }
})
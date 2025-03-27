import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";

function embedManager(message: string, type: "danger" | "warning" | "info" | "success") {
    const emoji = {
        danger: "❌",
        warning: "⚠️",
        info: "ℹ️",
        success: "✅"
    }[type];
    const color = settings.colors[type];

    const embed = createEmbed({
        description: `${emoji} | ${message}`,
        color,
        timestamp: new Date().toISOString()
    });

    return embed;
}

export const res = {
    success(message: string) {
        return { embeds: [embedManager(message, "success")]};
    }, 
    danger(message: string) {
        return { embeds: [embedManager(message, "danger")]};
    },
    warning(message: string) {
        return { embeds: [embedManager(message, "warning")]};
    },
    info(message: string) {
        return { embeds: [embedManager(message, "info")]};
    }
}
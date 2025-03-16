import { ActivityType } from "discord.js";

export interface GuildData {
    owner: string,
    superAdminRoles?: string[],
    adminRoles?: string[],
    modRoles?: string[],
    blackListedUsers?: string[],
    embeds?: Embed[],
    tickets?: TicketDetails[],
    logsChannel?: string,
    ticketsExisting?: { [key: string]: string },
    activity: {
        status: "online" | "idle" | "dnd" | "invisible",
        type: keyof typeof ActivityType
        text: string
    }
}

interface Embed {
    name: string;
    color: string;
    title?: string;
    description?: string;
    fields?: EmbedField[];
    footer?: EmbedFooter;
    author?: EmbedAuthor;
    thumbnail?: EmbedThumbnail;
    image?: EmbedImage;
    tickets?: Array<string>[]
}

interface EmbedField {
    value: string;
    name: string;
    inline: boolean; // Opcional
}

interface EmbedFooter {
    text: string;
    proxy_icon_url?: string; // Opcional
    icon_url?: string; // Opcional
}

interface EmbedAuthor {
    url: string; // Opcional
    proxy_icon_url?: string; // Opcional
    name?: string; // Opcional
    icon_url?: string; // Opcional
}

interface EmbedThumbnail {
    width?: number; // Opcional
    url?: string; // Opcional
    proxy_url?: string; // Opcional
    height?: number; // Opcional
    flags?: number; // Opcional
}

interface EmbedImage {
    width?: number; // Opcional
    url?: string; // Obrigatório
    proxy_url?: string; // Opcional
    height?: number; // Opcional
    flags?: number; // Opcional
}

interface TicketDetails {
    ticketname: string; // nome do ticket
    labelMenu: string // nome do menu
    descriptionMenu?: string; // descrição no menu
    emojiMenu?: string; // emoji no menu
    ticketMessage?: string; // conteúdo ao abrir ticket
    embedMessage?: string; // embed ao abrir ticket
}
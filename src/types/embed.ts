export default interface Embed {
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
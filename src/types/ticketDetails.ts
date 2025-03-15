export default interface TicketDetails {
    ticketname: string; // nome do ticket
    labelMenu: string // nome do menu
    descriptionMenu?: string; // descrição no menu
    emojiMenu?: string; // emoji no menu
    ticketMessage?: string; // conteúdo ao abrir ticket
    embedMessage?: string; // embed ao abrir ticket
    closeTicketMessage?: string; // conteúdo ao fechar ticket
    closeTicketEmbedMessage?: string; // embed ao fechar ticket
}
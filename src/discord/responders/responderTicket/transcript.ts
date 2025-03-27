import { createResponder, ResponderType } from "#base";
import { Message } from "discord.js";
import { generateMessagesHTML, res } from "#functions";
import fs from "fs";
import { db } from "#database";

interface MessageFormat {
    id: string;
    author: {
        id: string;
        username: string;
        avatar: string | null;
        isSupporter?: boolean;
        role?: string;
    };
    content: string;
    timestamp: Date;
    isReply?: boolean;
    attachments?: Array<{
        url: string;
        contentType?: string;
        name?: string;
    }>;
}

createResponder({
    customId: "ticket/transcript",
    types: [ ResponderType.Button ],
    async run(interaction) {
        if (!interaction.channel) return;
        await interaction.reply(res.warning("Gerando o ticket..."))

        const staffsRoles = {
            owner: await db.guilds.get<string>("owner"),
            superAdmins: await db.guilds.get<string[]>("superAdminRoles"),
            admins: await db.guilds.get<string[]>("adminRoles"),
            mods: await db.guilds.get<string[]>("modRoles"),
        }
        const ownerTicket = await db.guilds.get<string>(`ticketsExisting.${interaction.channel.id}`);
        const ownerUsername = ownerTicket ? (await interaction.client.users.fetch(ownerTicket)).username : "Unknown";

        const fetched = await interaction.channel.messages.fetch();
        fetched.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        const messages = Array.from(fetched.values());
        
        const role = (message: Message) => {
            const member = message.member;
            const roles = member?.roles.cache;
            if (message.author.id === staffsRoles.owner) return "Owner";
            if (roles?.some(role => staffsRoles.superAdmins?.includes(role.id))) return "Super Admin";
            if (roles?.some(role => staffsRoles.admins?.includes(role.id))) return "Admin";
            if (roles?.some(role => staffsRoles.mods?.includes(role.id))) return "Moderator";
            if (ownerTicket && ownerTicket === message.author.id) return "Owner Ticket";
            if (message.author.id === interaction.client.user?.id) return "Self";
            if (message.author.bot) return "Bot";
            return "Guest";
        }

        const messagesFormated: MessageFormat[] = messages.map(message => ({
            id: message.id,
            author: {
                id: message.author.id,
                username: message.author.username,
                avatar: message.author.avatarURL(),
                isSupporter: false,
                role: role(message)
            },
            content: message.content || message.embeds.map(embed => embed.description).join(" "),
            timestamp: new Date(message.createdTimestamp),
            isReply: message.reference?.messageId ? true : false,
            attachments: message.attachments.map(attachment => ({
                url: attachment.url,
                contentType: attachment.contentType ?? undefined,
                name: attachment.name
            }))
        }));

        try {
            const result = generateMessagesHTML(messagesFormated, {
                title: "Transcript",
                subtitle: ownerUsername,
                watermarks: {
                    topRight: "Feito por BirdTool",
                    topLeft: "Fique atento ao github: BirdTool/ticktool-b"
                }
            });

            await fs.writeFileSync(`ticket-${ownerUsername}.html`, result)
            
            await interaction.editReply(res.success("Arquivo criado com sucesso!"));
            await interaction.followUp({ files: [{ attachment: `ticket-${ownerUsername}.html`, name: `ticket-${ownerUsername}.html` }] });
            
            setTimeout(() => fs.unlinkSync(`ticket-${ownerUsername}.html`), 1000 * 60);
        } catch (error) {
            await interaction.editReply(res.danger("Um erro ocorreu ao transcrever o ticket!"));
            await interaction.followUp(`\`\`\`js\n${error}\n\`\`\``);
            console.error(error);
        }
    }
});

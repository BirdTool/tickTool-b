import { ChannelType, roleMention, time } from "discord.js";
import { createResponder, ResponderType, Store } from "#base";
import { db } from "#database";
import { createEmbed } from "@magicyan/discord";
import { Embed, TicketDetails } from "#types";

const cooldown = new Store<Date>();

createResponder({
    customId: "open-ticket/button/:choice",
    types: [ResponderType.Button],
    async run(interaction, { choice }) {
        await interaction.deferReply({ flags });
        const inCooldown = cooldown.get(interaction.user.id);

        if (inCooldown && inCooldown > new Date()) {
            return interaction.editReply({
                content: `Você está em cooldown. Você poderá criar um ticket novamente em ${time(inCooldown, "R")}`,
            });
        }

        
        const tickets = await db.guilds.get<TicketDetails[]>("tickets") || [];
        if (tickets.length === 0) {
            return interaction.editReply({
                content: "Erro: Não há tickets configurados!",
            });
        }

        const ticket = tickets.find(ticket => ticket.ticketname === choice);
        if (!ticket) {
            return interaction.editReply({
                content: "Erro: Ticket não encontrado!",
            });
        }
        
        if (!ticket.ticketMessage && !ticket.embedMessage) {
            return interaction.editReply({
                content: "Erro: É necessário ter pelo menos uma mensagem ou embed configurado!",
            });
        }

        cooldown.set(interaction.user.id, new Date(Date.now() + 1000 * 60 * 2));
        
        const roles = {
            owner: await db.guilds.get<string>("owner") as string,
            superAdmin: await db.guilds.get<string[]>("superAdminRoles") || [],
            admin: await db.guilds.get<string[]>("adminRoles") || [],
            moderator: await db.guilds.get<string[]>("modRoles") || [],
        };
        
        // Obtenha o canal de texto onde a thread será criada
        const parentChannel = interaction.channel;
        if (!parentChannel || parentChannel.type !== ChannelType.GuildText) {
            return interaction.editReply({
                content: "Erro: O canal atual não é um canal de texto válido!",
            });
        }

        const MAX_THREAD_NAME_LENGTH = 25;
        const ticketName = ticket.ticketname.length > 10 ? 'ticket' : ticket.ticketname;
        const availableSpace = MAX_THREAD_NAME_LENGTH - (ticketName.length + 1);
        
        // Se o nome do usuário for muito longo, corta ele para caber
        const username = interaction.user.username.length > availableSpace
            ? interaction.user.username.slice(0, availableSpace)
            : interaction.user.username;
        
        // Criação da thread privada
        const thread = await parentChannel.threads.create({
            name: `ticket-${username}`,
            autoArchiveDuration: 1440,
            invitable: false,
            type: ChannelType.PrivateThread,
            reason: `Ticket criado por ${interaction.user.tag}`
        });

        // Adicione o usuário que interagiu à thread
        await thread.members.add(interaction.user.id);

        // Adicione membros com cargos de staff à thread
        const guild = interaction.guild;
        if (!guild) {
            return interaction.editReply({
                content: "Erro: Guild não encontrada!",
            });
        }

        const staffRoles = [...roles.superAdmin, ...roles.admin, ...roles.moderator, roles.owner];
        
        await thread.send(staffRoles.map(roleId => roleMention(roleId)).join(" "))

        // Envie a mensagem de confirmação
        await interaction.editReply({
            content: `Ticket criado com sucesso em: ${thread.toString()}`,
        });

        await db.guilds.set(`ticketsExisting.${thread.id}`, interaction.user.id);

        
        // Envie a mensagem ou embed configurado no ticket
        if (ticket.ticketMessage) {
            const content = ticket.ticketMessage.replace(/{user}/g, `<@${interaction.user.id}>`);
            await thread.send(content);
        }
        if (ticket.embedMessage) {
            const embeds = await db.guilds.get<Embed[]>("embeds") || [];
            const embed = embeds.find(embed => embed.name === ticket.embedMessage);
            if (!embed) {
                await thread.send("Erro: Embed não encontrada!");
                return; // Encerra a execução se o embed não for encontrado
            }
        
            // Cria o embed
            const embedMaked = createEmbed({});
        
            // Define as propriedades do embed
            if (embed.title) embedMaked.setTitle(embed.title);
            if (embed.description) embedMaked.setDescription(embed.description.replace(/{user}/g, `<@${interaction.user.id}>`));
            if (embed.color) {
                // Converte a cor hexadecimal para número inteiro
                const colorHex = embed.color.startsWith("#") ? embed.color.slice(1) : embed.color;
                const colorInt = parseInt(colorHex, 16);
                embedMaked.setColor(colorInt);
            }
            if (embed.fields) embedMaked.addFields(embed.fields.map(field => ({ name: field.name, value: field.value, inline: field.inline })));
            if (embed.footer) embedMaked.setFooter({ text: embed.footer.text, iconURL: embed.footer.icon_url });
            if (embed.author) embedMaked.setAuthor({ name: embed.author.name, iconURL: embed.author.icon_url, url: embed.author.url });
            if (embed.thumbnail) embedMaked.setThumbnail(embed.thumbnail.url || null);
            if (embed.image) embedMaked.setImage(embed.image.url || null);
        
            // Envia o embed criado
            await thread.send({ embeds: [embedMaked] });
        }
        return
    }
});
import { createCommand } from "#base";
import { db } from "#database";
import { res } from "#functions";
import { settings } from "#settings";
import { TicketDetails } from "#types";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { AttachmentBuilder, ButtonBuilder, ButtonStyle, channelMention } from "discord.js";
import { ApplicationCommandType } from "discord.js";
import path from "path";

createCommand({
    name: "start",
    description: "começa as alterações rapidamente para vocẽ",
    type: ApplicationCommandType.ChatInput,
    async run(interaction){
        const startTime = Date.now();
        let message = brBuilder(
            "Iniciando configurações rápidas..."
        );
        
        const reply = await interaction.reply(res.warning(message));
        
        // Função para atualizar a mensagem com nova linha
        const updateMessage = async (newLine: string) => {
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
            message += brBuilder(`\n\n${newLine} (**${elapsedTime}**s)`);
            await interaction.editReply(res.warning(message));
        };
        
        const logChannel = async () => {
            const allChannels = await interaction.guild.channels.fetch();
            const findLogChannel = allChannels.find((channel) => channel?.name?.includes("log"));

            try {
                if (!findLogChannel) {
                    const staffCategory = allChannels.find(c => c?.name?.toLowerCase() === "staff" && c.type === 4);
                    if (staffCategory) {
                        const logChannel = await interaction.guild.channels.create({
                            name: "logs",
                            parent: staffCategory.id,
                            type: 0,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.roles.everyone,
                                    deny: ["SendMessages"]
                                }
                            ]
                        });
                        await db.guilds.set("logsChannel", logChannel.id);
                        
                        await updateMessage(`Canal de logs criado com sucesso: ${channelMention(logChannel.id)}`);
                    } else {       
                        const ticktoolCategory = await interaction.guild.channels.create({
                            name: "ticktool",
                            type: 4
                        });
                        
                        const logChannel = await interaction.guild.channels.create({
                            name: "logs",
                            parent: ticktoolCategory.id,
                            type: 0,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.roles.everyone,
                                    deny: ["SendMessages"]
                                }
                            ]
                        });
    
                        await db.guilds.set("logsChannel", logChannel.id);
                        
                        await updateMessage(`Canal de logs criado com sucesso: ${channelMention(logChannel.id)}`);
                    }
                }
    
                if (findLogChannel && Array.isArray(findLogChannel) && findLogChannel.length > 1) {
                    const staffLogChannel = allChannels.find((channel) => 
                        channel?.name?.includes("log") && channel?.name?.includes("staff")
                    );
                    
                    if (staffLogChannel) {
                        await db.guilds.set("logsChannel", staffLogChannel.id)

                        await updateMessage(`Canal de logs de staff selecionado: ${channelMention(staffLogChannel.id)}`);
                    } else {
                        const lastLogChannel = findLogChannel[findLogChannel.length - 1];
                        await db.guilds.set("logsChannel", lastLogChannel.id);
                        await updateMessage(`Último canal de logs selecionado: ${channelMention(lastLogChannel.id)}`);
                    }
                }
    
                if (findLogChannel) {
                    await db.guilds.set("logsChannel", findLogChannel.id);
                    await updateMessage(`Canal de logs definido: ${channelMention(findLogChannel.id)}`);
                }
            } catch (e: any) {
                console.error("Erro ao criar um canal de logs:", e)
                await updateMessage(`Erro ao criar um canal de logs: ${e.message}`);
            }            
        }

        const roles = async () => {
            const allRoles = await interaction.guild.roles.fetch();
            const ownerKeywords = ["superadmin", "super admin", "owner", "dono", "ceo"];
            const superAdminRoles = allRoles
                .filter(role => ownerKeywords.some(keyword => role.name.toLowerCase().includes(keyword)))
                .map(role => role.id) || [];
            const adminRoles = allRoles
                .filter(role => role.name.toLowerCase().includes("admin"))
                .map(role => role.id) || [];
            const modRoles = allRoles
                .filter(role => role.name.toLowerCase().includes("mod"))
                .map(role => role.id) || [];

            await db.guilds.set("modRoles", modRoles);
            await db.guilds.set("adminRoles", adminRoles);
            await db.guilds.set("superAdminRoles", superAdminRoles);

            await updateMessage(`Funções definidas com sucesso!: \n- Super Admin: ${superAdminRoles.map(role => `<@&${role}>`).join(", ") || "\`Não foram encontrados super admins\`"}\n- Admin: ${adminRoles.map(role => `<@&${role}>`).join(", ")  || "\`Não foram encontrados super admins\`"}\n- Mod: ${modRoles.map(role => `<@&${role}>`).join(", ")  || "\`Não foram encontrados super admins\`"}`);
        }

        const logoPath = path.join(process.cwd(), "src", "assets", "logo-ticktool-b-300px.png");
        
        const channelToSendEmbed = async () => {
            try {
                const allChannels = await interaction.guild.channels.fetch();
                const channelsKeywords = ["atendimento", "suporte", "ticket"];
                const channels = Array.from(allChannels
                    .filter(channel => 
                        channel && 
                        'name' in channel && 
                        channel.isTextBased() &&
                        channelsKeywords.some(keyword => channel.name.toLowerCase().includes(keyword))
                    )
                    .values());
        
                const logoAttachment = new AttachmentBuilder(logoPath, { name: 'logo-ticktool.png' });
        
                const newTicket: TicketDetails = {
                    ticketname: "fastIniTicket",
                    labelMenu: "Suporte",
                    emojiMenu: "🎫",
                    ticketMessage: `Seja bem vindo ao ticket {user}, siga as instruções: \n - Envie uma mensagem contendo todas as informações do seu problema \n Não marque um staff, espere eles entrar em contato com você!`,
                };
        
                // Obter tickets existentes e adicionar o novo se não existir
                const tickets = await db.guilds.get<TicketDetails[]>("tickets") || [];
                if (!tickets.find(ticket => ticket.ticketname === newTicket.ticketname)) {
                    tickets.push(newTicket);
                    // Salvar o array atualizado
                    await db.guilds.set("tickets", tickets);
                    await updateMessage(`Ticket rápido criado com sucesso!`);
                }
        
                const embed = createEmbed({
                    title: "Suporte",
                    description: brBuilder(
                        `Clique no botão abaixo para criar um ticket!`
                    ),
                    footer: { text: "Não crie tickets sem motivo, sujeito a punição", iconURL: 'attachment://logo-ticktool.png' },
                    color: "#871717",
                    thumbnail: interaction.guild?.iconURL() || 'attachment://logo-ticktool.png'
                });
                
                const button = new ButtonBuilder({
                    label: "Criar Ticket",
                    customId: `open-ticket/button/fastIniTicket`,
                    style: ButtonStyle.Success
                });
        
                const sendEmbed = async (channelID: string) => {
                    const channel = interaction.guild?.channels.cache.get(channelID);
                    
                    if (!channel?.isTextBased()) {
                        await updateMessage(`Canal ${channelID} não é um canal de texto válido.`);
                        console.error("Canal de texto inválido")
                        return false;
                    }
                    
                    await channel.send({
                        embeds: [embed],
                        files: [logoAttachment],
                        components: [{ type: 1, components: [button] }]
                    });
                    
                    await updateMessage(`Enviado o embed no canal: ${channelMention(channel.id)}`);
                    return true;
                };
        
                // Verificar canais existentes
                if (channels.length > 0) {
                    const atendimento = channels.find(channel => channel?.name?.toLowerCase().includes("atendimento"));
                    const suporte = channels.find(channel => channel?.name?.toLowerCase().includes("suporte"));
                    const ticket = channels.find(channel => channel?.name?.toLowerCase().includes("ticket"));
                    
                    if (atendimento) {
                        return await sendEmbed(atendimento.id);
                    }
                    if (suporte) {
                        return await sendEmbed(suporte.id);
                    }
                    if (ticket) {
                        return await sendEmbed(ticket.id);
                    }
                }
        
                // Se não encontrou nenhum canal adequado, criar um novo
                const logChannel = await db.guilds.get<string>("logsChannel");
                const logChannelObj = logChannel ? interaction.guild?.channels.cache.get(logChannel) : null;
                const logChannelParent = logChannelObj?.parent;
        
                try {
                    const atendimento = await interaction.guild.channels.create({
                        name: "atendimento",
                        parent: logChannelParent?.id,
                        type: 0,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone,
                                deny: ["SendMessages"]
                            }
                        ]
                    });

                    await updateMessage(`Novo canal criado para atendimento: ${channelMention(atendimento.id)}`);
                    return await sendEmbed(atendimento.id);
                } catch (e: any) {
                    console.error(`Erro ao criar novo canal:`, e);
                    await updateMessage(`Erro ao criar canal de atendimento: ${e.message}`);
                    return false;
                }
            } catch (error: any) {
                console.error("Erro em channelToSendEmbed:", error);
                await updateMessage(`Erro ao configurar canal de atendimento: ${error.message}`);
                return false;
            }
        };

        await logChannel();
        await roles();
        await channelToSendEmbed();
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        const content = await interaction.fetchReply();
        const description = content.embeds[0]?.description?.replace("⚠️ | Iniciando configurações rápidas...\n\n", "");
        const embed = createEmbed({
            title: "Concluido",
            description,
            color: settings.colors.success,
            footer: { text: `Configuração rápida concluída! Tempo total: ${totalTime}s` }
        })

        return interaction.editReply({ embeds: [embed] })
    }
});

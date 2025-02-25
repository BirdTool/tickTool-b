import { createResponder, ResponderType } from "#base";
import { createEmbed } from "@magicyan/discord";
import { menus } from "#menus";
import { db } from "#database";
createResponder({
    customId: "manage/embeds/select",
    types: [ResponderType.StringSelect], cache: "cached",
    async run(interaction) {
        const embeds = await db.guilds.get("embeds") || [];
        const embed = embeds.find(embed => embed.name === interaction.values[0]);
        if (!embed)
            return interaction.reply({ content: "Embed não encontrado.", ephemeral: true });
        // atualizar o embed atual para o embed selecionado
        const embedMessage = createEmbed({});
        if (embed.title)
            embedMessage.setTitle(embed.title);
        if (embed.description)
            embedMessage.setDescription(embed.description);
        if (embed.fields)
            embedMessage.addFields(embed.fields);
        if (embed.color)
            embedMessage.setColor(embed.color);
        if (embed.footer)
            embedMessage.setFooter({ text: embed.footer.text, iconURL: embed.footer.icon_url || null, proxyIconURL: embed.footer.proxy_icon_url || null });
        if (embed.author)
            embedMessage.setAuthor({ name: embed.author.name, iconURL: embed.author.icon_url || null, url: embed.author.url || null, proxyIconURL: embed.author.proxy_icon_url || null });
        if (embed.thumbnail)
            embedMessage.setThumbnail(embed.thumbnail.url);
        if (embed.image)
            embedMessage.setImage(embed.image.url);
        return await interaction.update({ embeds: [embedMessage], components: menus.createEmbed().components });
    }
});

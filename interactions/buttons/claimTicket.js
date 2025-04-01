module.exports = {
    customId: 'claim_ticket',
    
    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has(client.config.sellerRoleId)) {
            return interaction.reply({
                content: 'Hanya seller yang bisa mengklaim tiket ini!',
                ephemeral: true
            });
        }

        const ticket = await client.database.getTicket(interaction.channel.id);
        if (!ticket) return;

        if (ticket.claimed) {
            return interaction.reply({
                content: `Tiket ini sudah diklaim oleh <@${ticket.claimedBy}>`,
                ephemeral: true
            });
        }

        // Update ticket in database
        await client.database.claimTicket(interaction.channel.id, interaction.user.id);

        // Update embed
        const embed = interaction.message.embeds[0];
        embed.data.description = embed.data.description.replace(
            '**Membeli**\nThe staff will help you soon!',
            `**Membeli**\nSedang ditangani oleh <@${interaction.user.id}>`
        );
        
        embed.data.fields = embed.data.fields || [];
        embed.data.fields.push({
            name: 'Claimed by',
            value: interaction.user.tag,
            inline: true
        });

        await interaction.message.edit({ embeds: [embed] });

        await interaction.reply({
            content: `Tiket telah diklaim oleh ${interaction.user}`,
            ephemeral: false
        });
    }
};
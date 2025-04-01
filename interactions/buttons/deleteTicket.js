module.exports = {
    customId: 'delete_ticket',
    
    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has(client.config.sellerRoleId)) {
            return interaction.reply({
                content: 'Hanya seller yang bisa menghapus tiket ini!',
                ephemeral: true
            });
        }

        const ticket = await client.database.getTicket(interaction.channel.id);
        if (!ticket) return;

        // Kirim log sebelum menghapus
        const logChannel = interaction.guild.channels.cache.get(client.config.logChannelId);
        if (logChannel) {
            const logEmbed = new client.discord.EmbedBuilder()
                .setTitle('Tiket Dihapus')
                .setDescription(`Tiket dari <@${ticket.userId}> telah dihapus oleh ${interaction.user.tag}`)
                .addFields(
                    { name: 'Channel', value: interaction.channel.name, inline: true },
                    { name: 'Dibuat Pada', value: new Date(ticket.createdAt).toLocaleString(), inline: true }
                )
                .setColor('#ff0000');

            await logChannel.send({ embeds: [logEmbed] });
        }

        // Hapus channel segera
        try {
            await client.utils.createTranscript(interaction.channel);
            await interaction.channel.delete('Tiket dihapus oleh seller');
        } catch (error) {
            console.error('Gagal menghapus channel:', error);
        }
    }
};
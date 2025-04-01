module.exports = {
    customId: 'feedback_modal',
    
    async execute(interaction, client) {
        const feedback = interaction.fields.getTextInputValue('feedback_input');
        const userId = interaction.user.id;
        
        // Simpan testimoni ke database
        await client.database.saveTestimoni({
            userId,
            feedback,
            date: new Date()
        });

        // Kirim testimoni ke channel khusus
        const testimoniChannel = interaction.guild.channels.cache.get(client.config.testimoniChannelId);
        if (testimoniChannel) {
            const testimoniEmbed = new client.discord.EmbedBuilder()
                .setTitle('TESTIMONI BARU')
                .setDescription(feedback)
                .addFields(
                    { name: 'Dari', value: `<@${userId}>`, inline: true },
                    { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setColor('#ffcc00');

            await testimoniChannel.send({ embeds: [testimoniEmbed] });
        }

        await interaction.reply({
            content: 'Terima kasih atas testimoni Anda!',
            ephemeral: true
        });
    }
};
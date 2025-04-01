module.exports = {
    customId: 'close_ticket',
    
    async execute(interaction, client) {
        const ticket = await client.database.getTicket(interaction.channel.id);
        if (!ticket) return;

        // Hanya seller atau pembuat tiket yang bisa menutup
        if (!interaction.member.roles.cache.has(client.config.sellerRoleId) && 
            interaction.user.id !== ticket.userId) {
            return interaction.reply({
                content: 'Hanya seller atau pembuat tiket yang bisa menutup tiket ini!',
                ephemeral: true
            });
        }

        // Update database
        await client.database.closeTicket(interaction.channel.id);

        // Kirim konfirmasi
        await interaction.reply({
            content: 'Tiket ini akan ditutup dalam 5 detik...'
        });

        // Hapus channel setelah delay
        setTimeout(async () => {
            try {
                // Buat transcript sebelum menghapus
                await client.utils.createTranscript(interaction.channel);
                await interaction.channel.delete('Tiket ditutup');
            } catch (error) {
                console.error('Gagal menghapus channel:', error);
            }
        }, 5000);
    }
};
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    customId: 'ticket_category',
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        
        // Cek limit tiket
        const activeTickets = await client.database.getUserTickets(interaction.user.id);
        if (activeTickets.length >= 3) {
            return interaction.editReply({
                content: '❌ Anda sudah memiliki 3 tiket aktif! Silakan tutup salah satu tiket sebelum membuat yang baru.'
            });
        }
        
        const selectedCategory = interaction.values[0];
        const categoryId = client.config.ticketCategories[selectedCategory];
        
        if (!categoryId) {
            return interaction.editReply({
                content: '⚠️ Kategori tidak valid!'
            });
        }

        try {
            // Buat channel tiket
            const channel = await interaction.guild.channels.create({
                name: `tiket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: ['ViewChannel']
                    },
                    {
                        id: interaction.user.id,
                        allow: ['ViewChannel', 'SendMessages', 'AttachFiles', 'EmbedLinks']
                    },
                    {
                        id: client.config.sellerRoleId,
                        allow: ['ViewChannel', 'SendMessages', 'ManageMessages', 'EmbedLinks']
                    }
                ]
            });

            // Buat data tiket
            const ticket = await client.database.createTicket({
                channelId: channel.id,
                userId: interaction.user.id,
                category: selectedCategory,
                userTag: interaction.user.tag
            });

            // Buat embed tiket
            const ticketEmbed = new EmbedBuilder()
                .setTitle(`TIKET #${ticket.ticketNumber}`)
                .setDescription(`Halo ${interaction.user}, silakan jelaskan kebutuhan Anda.\n\n**Staff akan segera menanggapi.**`)
                .addFields(
                    { name: 'Kategori', value: this.getCategoryName(selectedCategory), inline: true },
                    { name: 'Status', value: '🟢 Menunggu', inline: true },
                    { name: 'Dibuat', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setColor('#5865F2')
                .setFooter({ text: `ID: ${interaction.user.id}` })
                .setTimestamp();

            // Buat action buttons
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('claim_ticket')
                    .setLabel('Claim Tiket')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('👨‍💼'),
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Tutup Tiket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

            // Kirim ke channel
            await channel.send({
                content: `${interaction.user} <@&${client.config.sellerRoleId}>`,
                embeds: [ticketEmbed],
                components: [buttons]
            });

            await interaction.editReply({
                content: `✅ Tiket Anda telah dibuat: ${channel}`
            });

        } catch (error) {
            console.error('Error membuat tiket:', error);
            await interaction.editReply({
                content: '❌ Gagal membuat tiket! Silakan coba lagi atau hubungi admin.'
            });
        }
    },

    getCategoryName(category) {
        const names = {
            'membeli': 'Pembelian Produk',
            'bantuan': 'Bantuan Teknis',
            'lainnya': 'Pertanyaan Lain'
        };
        return names[category] || category;
    },

    createSelectMenu() {
        return new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_category')
                .setPlaceholder('Pilih jenis tiket...')
                .addOptions(
                    {
                        label: 'Pembelian Produk',
                        description: 'Beli produk',
                        value: 'membeli',
                        emoji: '🛒'
                    },
                    {
                        label: 'Bantuan Teknis',
                        description: 'Masalah dengan produk',
                        value: 'bantuan',
                        emoji: '❓'
                    },
                    {
                        label: 'Pertanyaan Lain',
                        description: 'Untuk pertanyaan lainnya',
                        value: 'lainnya',
                        emoji: '❗'
                    }
                )
        );
    }
};
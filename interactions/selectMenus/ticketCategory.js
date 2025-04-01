const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    StringSelectMenuBuilder,
    PermissionFlagsBits 
} = require('discord.js');

module.exports = {
    customId: 'ticket_category',
    
    async execute(interaction, client) {
        // Defer the reply first to prevent duplicate responses
        await interaction.deferReply({ ephemeral: true });

        try {
            const selectedCategory = interaction.values[0];
            const userId = interaction.user.id;
            
            // Check for existing tickets
            const userTickets = await client.database.getUserTickets(userId);
            const existingTicket = userTickets.find(t => t.category === selectedCategory);
            
            if (existingTicket) {
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500) // Orange
                    .setTitle('🎫 Ticket Sudah Ada')
                    .setDescription(`Anda sudah memiliki tiket terbuka untuk kategori ini!`)
                    .addFields(
                        { name: 'Kategori', value: this.getCategoryName(selectedCategory), inline: true },
                        { name: 'Channel', value: `<#${existingTicket.channelId}>`, inline: true }
                    );
                
                return interaction.editReply({ embeds: [embed] });
            }

            // Create ticket channel
            const categoryId = client.config.ticketCategories[selectedCategory];
            if (!categoryId) {
                return interaction.editReply({
                    content: '❌ Kategori tiket tidak valid!'
                });
            }

            const category = await interaction.guild.channels.fetch(categoryId);
            if (!category) {
                return interaction.editReply({
                    content: '❌ Kategori channel tidak ditemukan!'
                });
            }

            const channelName = `${selectedCategory}-${interaction.user.username}`.toLowerCase();
            const ticketChannel = await category.guild.channels.create({
                name: channelName.slice(0, 100), // Ensure name isn't too long
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: client.config.sellerRoleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.ManageChannels
                        ]
                    }
                ]
            });

            // Save to database
            const ticketData = {
                userId: interaction.user.id,
                channelId: ticketChannel.id,
                category: selectedCategory,
                username: interaction.user.tag,
                ticketNumber: client.database.getNextTicketNumber(selectedCategory)
            };
            await client.database.createTicket(ticketData);

            // Create initial embed
            const embed = new EmbedBuilder()
                .setColor(0x3498DB) // Blue
                .setTitle(`🎫 Ticket #${ticketData.ticketNumber}`)
                .setDescription(`Halo ${interaction.user.toString()}!\n\nStaff akan segera membantu Anda.`)
                .addFields(
                    { name: 'Kategori', value: this.getCategoryName(selectedCategory), inline: true },
                    { name: 'Status', value: '🟢 Terbuka', inline: true },
                    { name: 'Dibuat pada', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setFooter({ text: `User ID: ${interaction.user.id}` });

            // Create action buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Tutup Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('claim_ticket')
                    .setLabel('Klaim Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🙋‍♂️')
            );

            // Send initial message
            await ticketChannel.send({
                content: `${interaction.user.toString()} <@&${client.config.sellerRoleId}>`,
                embeds: [embed],
                components: [row]
            });

            // Respond to user
            await interaction.editReply({
                content: `✅ Ticket Anda telah dibuat: ${ticketChannel.toString()}`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in ticket category selection:', error);
            await interaction.editReply({
                content: '❌ Terjadi kesalahan saat membuat ticket!',
                ephemeral: true
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
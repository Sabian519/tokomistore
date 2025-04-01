const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const testimonials = require('../utils/testimonials');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('approve_testimoni')
        .setDescription('Kelola persetujuan testimoni dari pelanggan')
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('Lihat daftar testimoni yang belum disetujui'))
        .addSubcommand(subcommand =>
            subcommand.setName('approve')
                .setDescription('Setujui testimoni tertentu')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('ID testimoni yang akan disetujui')
                        .setRequired(true))),
    
    async execute(interaction, client) {
        // Periksa role admin/seller
        if (!interaction.member.roles.cache.has(client.config.sellerRoleId)) {
            return interaction.reply({
                content: '❌ Hanya seller yang bisa menyetujui testimoni!',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        
        try {
            if (subcommand === 'list') {
                await handleListTestimonials(interaction, client);
            } else if (subcommand === 'approve') {
                await handleApproveTestimonial(interaction, client);
            }
        } catch (error) {
            console.error('Error in approve_testimoni:', error);
            await interaction.reply({
                content: '❌ Terjadi kesalahan saat memproses testimoni!',
                ephemeral: true
            });
        }
    }
};

async function handleListTestimonials(interaction, client) {
    const pendingTestimonials = testimonials.getPendingTestimonials();
    
    if (pendingTestimonials.length === 0) {
        return interaction.reply({
            content: '✅ Tidak ada testimoni yang perlu disetujui saat ini.',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('📋 Daftar Testimoni Belum Disetujui')
        .setColor(0xFFA500) // Orange
        .setDescription(`Total: ${pendingTestimonials.length} testimoni menunggu persetujuan`);

    pendingTestimonials.slice(0, 5).forEach(testimonial => {
        embed.addFields({
            name: `ID: ${testimonial.id} | Produk: ${testimonial.product}`,
            value: `**User:** ${testimonial.username}\n` +
                   `**Testimoni:** ${testimonial.feedback.substring(0, 100)}${testimonial.feedback.length > 100 ? '...' : ''}`
        });
    });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('refresh_testimonials')
                .setLabel('Refresh')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔄')
        );

    await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    });
}

async function handleApproveTestimonial(interaction, client) {
    const testimonialId = interaction.options.getString('id');
    const approvedTestimonial = testimonials.approveTestimonial(testimonialId, interaction.user.tag);

    if (!approvedTestimonial) {
        return interaction.reply({
            content: '❌ Testimoni tidak ditemukan atau sudah disetujui sebelumnya!',
            ephemeral: true
        });
    }

    // Kirim ke channel testimoni
    const testimoniChannel = await client.channels.fetch(client.config.testimoniChannelId);
    if (testimoniChannel) {
        const approvedEmbed = new EmbedBuilder()
            .setColor(0x4CAF50) // Green
            .setAuthor({
                name: `${approvedTestimonial.username} - Testimoni Disetujui`,
                iconURL: approvedTestimonial.userAvatar
            })
            .setTitle(`⭐ Testimoni #${approvedTestimonial.id}`)
            .setDescription(approvedTestimonial.feedback)
            .addFields(
                { name: 'Produk', value: approvedTestimonial.product, inline: true },
                { name: 'Disetujui oleh', value: interaction.user.tag, inline: true }
            )
            .setFooter({ 
                text: `Dikirim: ${approvedTestimonial.date.toLocaleString('id-ID')} | Disetujui: ${new Date().toLocaleString('id-ID')}`
            });

        await testimoniChannel.send({ embeds: [approvedEmbed] });
    }

    await interaction.reply({
        content: `✅ Testimoni #${testimonialId} telah disetujui dan dipublikasikan!`,
        ephemeral: true
    });
}
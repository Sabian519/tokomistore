// commands/testimoni.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const testimonials = require('../utils/testimonials');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testimoni')
        .setDescription('Beri testimoni untuk pengalaman berbelanja Anda')
        .addStringOption(option =>
            option.setName('produk')
                .setDescription('Nama produk yang dibeli')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('feedback')
                .setDescription('Masukkan testimoni Anda (min. 20 karakter)')
                .setRequired(true)
                .setMinLength(20)),
    
    async execute(interaction) {
        const product = interaction.options.getString('produk');
        const feedback = interaction.options.getString('feedback');
        const user = interaction.user;

        // Validasi input
        if (feedback.length < 20) {
            return interaction.reply({
                content: '❌ Testimoni harus minimal 20 karakter!',
                ephemeral: true
            });
        }

        // Tambahkan testimoni
        const newTestimonial = testimonials.addTestimonial(user, product, feedback);

        // Beri respon ke user
        const embed = new EmbedBuilder()
            .setColor(0x2196F3) // Blue
            .setAuthor({
                name: `${user.username} - Testimoni Baru`,
                iconURL: user.displayAvatarURL()
            })
            .setTitle(`📝 Testimoni #${newTestimonial.id}`)
            .setDescription('Terima kasih atas testimoni Anda!')
            .addFields(
                { name: 'Produk', value: product, inline: true },
                { name: 'Status', value: '🟡 Menunggu persetujuan', inline: true }
            )
            .setFooter({ text: 'Testimoni Anda akan ditinjau oleh tim kami' });

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};
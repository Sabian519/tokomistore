const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createTestimoniEmbed } = require('../utils/embeds');
const { saveTestimoni } = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testimoni')
        .setDescription('Beri testimoni untuk order yang telah selesai')
        .addStringOption(option => 
            option.setName('product')
                .setDescription('Nama produk yang dibeli')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('payment')
                .setDescription('Metode pembayaran')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('price')
                .setDescription('Harga produk')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('feedback')
                .setDescription('Testimoni Anda')
                .setRequired(true))
        .addAttachmentOption(option => 
            option.setName('image')
                .setDescription('Upload bukti/foto (opsional)')),
    
    async execute(interaction) {
        const product = interaction.options.getString('product');
        const payment = interaction.options.getString('payment');
        const price = interaction.options.getString('price');
        const feedback = interaction.options.getString('feedback');
        const image = interaction.options.getAttachment('image');

        // Save testimoni to database
        await saveTestimoni({
            userId: interaction.user.id,
            product,
            payment,
            price,
            feedback,
            imageUrl: image?.url,
            date: new Date()
        });

        // Create embeds
        const { testimoniEmbed, detailsEmbed } = createTestimoniEmbed(
            interaction.user, 
            product, 
            payment, 
            price, 
            feedback
        );

        const messageOptions = {
            content: `Testimoni baru dari <@${interaction.user.id}>`,
            embeds: [testimoniEmbed, detailsEmbed]
        };

        if (image) {
            messageOptions.files = [new AttachmentBuilder(image.url)];
        }

        const testimoniChannel = interaction.guild.channels.cache.get(
            interaction.client.config.testimoniChannelId
        );
        
        if (testimoniChannel) {
            await testimoniChannel.send(messageOptions);
        }

        await interaction.reply({
            content: 'Terima kasih atas testimoni Anda!',
            ephemeral: true
        });
    }
};
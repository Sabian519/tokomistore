const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createOrderEmbed } = require('../utils/embeds');
const { saveOrder } = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('complete_order')
        .setDescription('Tandai order sebagai selesai (Seller only)')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User yang melakukan order')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('product')
                .setDescription('Nama produk')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('payment')
                .setDescription('Metode pembayaran')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('price')
                .setDescription('Harga produk')
                .setRequired(true))
        .addAttachmentOption(option => 
            option.setName('image')
                .setDescription('Upload bukti/foto (opsional)')),
    
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(interaction.client.config.sellerRoleId)) {
            return interaction.reply({
                content: 'Hanya seller yang bisa menggunakan command ini!',
                ephemeral: true
            });
        }

        const user = interaction.options.getUser('user');
        const product = interaction.options.getString('product');
        const payment = interaction.options.getString('payment');
        const price = interaction.options.getString('price');
        const image = interaction.options.getAttachment('image');

        // Save order to database
        await saveOrder({
            userId: user.id,
            product,
            payment,
            price,
            imageUrl: image?.url,
            completedBy: interaction.user.id,
            date: new Date()
        });

        // Create embeds
        const { orderEmbed, detailsEmbed } = createOrderEmbed(user, product, payment, price);

        const messageOptions = {
            content: `<@${user.id}>`,
            embeds: [orderEmbed, detailsEmbed]
        };

        if (image) {
            messageOptions.files = [new AttachmentBuilder(image.url)];
            detailsEmbed.setImage(`attachment://${image.name}`);
        }

        await interaction.channel.send(messageOptions);
        await interaction.reply({
            content: `Order untuk ${user.tag} telah ditandai sebagai selesai!`,
            ephemeral: true
        });
    }
};
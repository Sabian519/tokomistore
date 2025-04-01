const { EmbedBuilder } = require('discord.js');

module.exports = {
    createOrderEmbed: (user, product, payment, price) => {
        const orderEmbed = new EmbedBuilder()
            .setTitle('ORDER COMPLETED')
            .setDescription(`## TESTIMONI #${Math.floor(Math.random() * 1000)}\nTerimakasih <@${user.id}> telah membeli di NeruShop`)
            .addFields(
                { name: '**Product:**', value: product, inline: true },
                { name: '**Payment:**', value: payment, inline: true },
                { name: '**Harga:**', value: price, inline: true }
            )
            .setFooter({ text: 'Gunakan command /testimoni untuk memberikan feedback' })
            .setColor('#00ff00');

        const detailsEmbed = new EmbedBuilder()
            .setTitle('📞️ 💬 Detail Order')
            .setDescription(`**DONE BY Tokomi Store**\n${product}`)
            .addFields(
                { name: 'Pelanggan', value: user.tag },
                { name: 'Tanggal', value: new Date().toLocaleString('id-ID') }
            )
            .setColor('#0099ff');

        return { orderEmbed, detailsEmbed };
    },

    createTestimoniEmbed: (user, product, payment, price, feedback) => {
        const testimoniEmbed = new EmbedBuilder()
            .setTitle('ORDER COMPLETED')
            .setDescription(`## TESTIMONI #${Math.floor(Math.random() * 1000)}\nTerimakasih <@${user.id}> telah membeli di NeruShop`)
            .addFields(
                { name: '**Product:**', value: product, inline: true },
                { name: '**Payment:**', value: payment, inline: true },
                { name: '**Harga:**', value: price, inline: true }
            )
            .setColor('#00ff00');

        const detailsEmbed = new EmbedBuilder()
            .setDescription(feedback)
            .setFooter({ text: `📞️ 💬 Terimakasih Telah Membeli di NeruShop | ${new Date().toLocaleString('id-ID')}` })
            .setColor('#0099ff');

        return { testimoniEmbed, detailsEmbed };
    }
};
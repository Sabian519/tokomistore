const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ticketCategory = require('../interactions/selectMenus/ticketCategory');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketpanel')
        .setDescription('Buat panel tiket publik (Admin only)')
        .setDefaultMemberPermissions('0'),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: '❌ Hanya admin yang bisa menggunakan command ini!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Tokomi Store TICKET APP')
            .setDescription('**Tokomi Store - Fast Respon**\nKlik tombol dibawah untuk membuat tiket')
            .addFields(
                { name: '🛒 **Membeli Produk**', value: 'Untuk pembelian produk' },
                { name: '❓ **Bantuan Teknis**', value: 'Untuk masalah teknis dengan produk' },
                { name: '❗ **Pertanyaan Lain**', value: 'Untuk pertanyaan lainnya' }
            )
            .setFooter({ 
                text: `Max 3 tiket aktif per user • ${new Date().toLocaleDateString('id-ID')}`,
                iconURL: interaction.guild.iconURL() 
            })
            .setColor('#5865F2')
            .setThumbnail('https://media.discordapp.net/attachments/868843849768910918/1354897606496747730/174306445270418pp2kmb.jpg?ex=67ec3c3a&is=67eaeaba&hm=4a3601332da3f2020e36594222f00dc9edda856ab08ab382b1e74192a21cfc83&=&format=webp&width=989&height=989')
            .setTimestamp()
            .setImage('https://cdn.discordapp.com/attachments/1354473632369348757/1356513610305896448/TOKOMI_OT.png?ex=67ecd73f&is=67eb85bf&hm=ea0f60f534c4821c16feaec5464464a46affab8dca086cdb61f3e67f099700f9&');

        await interaction.channel.send({
            embeds: [embed],
            components: [ticketCategory.createSelectMenu()]
        });

        await interaction.reply({
            content: '✅ Panel tiket berhasil dipasang!',
            ephemeral: true
        });
    }
};
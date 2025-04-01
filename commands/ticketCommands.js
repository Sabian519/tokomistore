const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ticketCategory = require('../interactions/selectMenus/ticketCategory');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Buat panel tiket publik (Admin only)')
        .setDefaultMemberPermissions('0'), // Hanya admin yang bisa menggunakan
    
    async execute(interaction) {
        // Buat embed
        const embed = new EmbedBuilder()
            .setTitle('TOKOMISTORE TICKET APP')
            .setDescription('**Tokomi Store - Fast Respon**\nAnda bisa klik tombol di bawah')
            .addFields(
                { 
                    name: '🛒 **Membeli:**', 
                    value: 'Buat ticket ini untuk membeli produk.', 
                    inline: false 
                },
                { 
                    name: '❓ **Bantuan:**', 
                    value: 'Buat ticket ini untuk bantuan.', 
                    inline: false 
                },
                { 
                    name: '❗ **Lainnya:**', 
                    value: 'Pertanyaan Lainnya.', 
                    inline: false 
                }
            )
            .setFooter({ 
                text: 'Warning: You can only create 3 ticket(s) at a time! • ' + new Date().toLocaleDateString('id-ID'), 
                iconURL: interaction.guild.iconURL() 
            })
            .setColor('#5865F2')
            .setThumbnail('https://media.discordapp.net/attachments/868843849768910918/1354897606496747730/174306445270418pp2kmb.jpg?ex=67ec3c3a&is=67eaeaba&hm=4a3601332da3f2020e36594222f00dc9edda856ab08ab382b1e74192a21cfc83&=&format=webp&width=989&height=989') // Logo NeruShop
            .setTimestamp();

        // Kirim panel ke channel
        await interaction.channel.send({
            embeds: [embed],
            components: [ticketCategory.createSelectMenu()]
        });

        // Beri konfirmasi ke admin
        await interaction.reply({
            content: '✅ Panel tiket berhasil dipublikasikan!',
            ephemeral: true
        });
    }
};
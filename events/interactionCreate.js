const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Slash Commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing command ${interaction.commandName}:`, error);
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: '❌ Terjadi error saat menjalankan command ini!',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: '❌ Terjadi error saat menjalankan command ini!',
                        ephemeral: true
                    });
                }
            }
            return;
        }

        // Button Interactions
        if (interaction.isButton()) {
            // Handle ticket creation separately
            if (interaction.customId === 'create_ticket') {
                const ticketCommand = client.commands.get('setup-tickets');
                if (ticketCommand?.handleCreateTicket) {
                    return ticketCommand.handleCreateTicket(interaction, client);
                }
            }

            // Handle other buttons
            const button = client.buttons.get(interaction.customId);
            if (!button) return;

            try {
                await button.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing button ${interaction.customId}:`, error);
                await interaction.reply({
                    content: '❌ Terjadi error saat memproses aksi ini!',
                    ephemeral: true
                });
            }
            return;
        }

        // Modal Interactions
        if (interaction.isModalSubmit()) {
            const modal = client.modals.get(interaction.customId);
            if (!modal) return;

            try {
                await modal.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing modal ${interaction.customId}:`, error);
                await interaction.reply({
                    content: '❌ Terjadi error saat mengirim data!',
                    ephemeral: true
                });
            }
            return;
        }

        // Select Menu Interactions
        if (interaction.isStringSelectMenu()) {
            const selectMenu = client.selectMenus.get(interaction.customId);
            if (!selectMenu) return;

            try {
                await selectMenu.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing select menu ${interaction.customId}:`, error);
                await interaction.reply({
                    content: '❌ Terjadi error saat memilih opsi!',
                    ephemeral: true
                });
            }
            return;
        }
    }
};
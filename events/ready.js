const { Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`✅ Bot ${client.user.tag} is ready!`);
        
        // Initialize collections
        client.commands = new Collection();
        client.buttons = new Collection();
        client.modals = new Collection();

        // Load slash commands
        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`[COMMAND] ${command.data.name} loaded`);
            }
        }

        // Load button interactions
        const buttonsPath = path.join(__dirname, '../interactions/buttons');
        if (fs.existsSync(buttonsPath)) {
            const buttonFiles = fs.readdirSync(buttonsPath)
                .filter(file => file.endsWith('.js'));
            
            for (const file of buttonFiles) {
                const button = require(path.join(buttonsPath, file));
                if ('customId' in button && 'execute' in button) {
                    client.buttons.set(button.customId, button);
                    console.log(`[BUTTON] ${button.customId} loaded`);
                }
            }
        }

        // Load modal interactions
        const modalsPath = path.join(__dirname, '../interactions/modals');
        if (fs.existsSync(modalsPath)) {
            const modalFiles = fs.readdirSync(modalsPath)
                .filter(file => file.endsWith('.js'));
            
            for (const file of modalFiles) {
                const modal = require(path.join(modalsPath, file));
                if ('customId' in modal && 'execute' in modal) {
                    client.modals.set(modal.customId, modal);
                    console.log(`[MODAL] ${modal.customId} loaded`);
                }
            }
        }

        // Set bot presence
        try {
            await client.user.setPresence({
                activities: [{
                    name: 'Tokomi Store',
                    type: ActivityType.Watching
                }],
                status: 'online'
            });
        } catch (error) {
            console.error('Failed to set presence:', error);
        }

        console.log(`[STATUS] ${client.user.tag} is now online!`);
    }
};
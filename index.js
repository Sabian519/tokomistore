const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const TokomiDatabase = require('./utils/database.js');

class TokomiClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ]
        });

        this.config = config;
        this.commands = new Collection();
        this.buttons = new Collection();
        this.selectMenus = new Collection();
        this.modals = new Collection();
        this.cooldowns = new Collection();
    }

    async initialize() {
        try {
            await this.loadHandlers();
            await this.login(this.config.token);
            
            this.once('ready', () => {
                this.user.setPresence({
                    activities: [{
                        name: 'Tokomi Tickets',
                        type: ActivityType.Watching
                    }],
                    status: 'online'
                });
                console.log(`✅ ${this.user.tag} is ready!`);
            });

        } catch (error) {
            console.error('❌ Failed to initialize bot:', error);
            process.exit(1);
        }
    }

    async loadHandlers() {
        // Load commands
        const commandsPath = path.join(__dirname, 'commands');
        if (fs.existsSync(commandsPath)) {
            const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
            
            for (const file of commandFiles) {
                try {
                    const command = require(path.join(commandsPath, file));
                    if (command.data && command.execute) {
                        this.commands.set(command.data.name, command);
                        console.log(`[COMMAND] ${command.data.name} loaded`);
                        
                        // Initialize cooldowns
                        if (command.cooldown) {
                            this.cooldowns.set(command.data.name, new Collection());
                        }
                    }
                } catch (error) {
                    console.error(`[ERROR] Failed to load command ${file}:`, error);
                }
            }
        }

        // Load events
        const eventsPath = path.join(__dirname, 'events');
        if (fs.existsSync(eventsPath)) {
            const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
            
            for (const file of eventFiles) {
                try {
                    const event = require(path.join(eventsPath, file));
                    if (event.once) {
                        this.once(event.name, (...args) => event.execute(...args, this));
                    } else {
                        this.on(event.name, (...args) => event.execute(...args, this));
                    }
                    console.log(`[EVENT] ${event.name} loaded`);
                } catch (error) {
                    console.error(`[ERROR] Failed to load event ${file}:`, error);
                }
            }
        }

        // Load interactions
        const interactionsPath = path.join(__dirname, 'interactions');
        if (fs.existsSync(interactionsPath)) {
            // Load buttons
            const buttonsPath = path.join(interactionsPath, 'buttons');
            if (fs.existsSync(buttonsPath)) {
                const buttonFiles = fs.readdirSync(buttonsPath).filter(f => f.endsWith('.js'));
                
                for (const file of buttonFiles) {
                    try {
                        const button = require(path.join(buttonsPath, file));
                        if (button.customId && button.execute) {
                            this.buttons.set(button.customId, button);
                            console.log(`[BUTTON] ${button.customId} loaded`);
                        }
                    } catch (error) {
                        console.error(`[ERROR] Failed to load button ${file}:`, error);
                    }
                }
            }
            
            // Load select menus
            const selectMenusPath = path.join(interactionsPath, 'selectMenus');
            if (fs.existsSync(selectMenusPath)) {
                const selectMenuFiles = fs.readdirSync(selectMenusPath).filter(f => f.endsWith('.js'));
                
                for (const file of selectMenuFiles) {
                    try {
                        const menu = require(path.join(selectMenusPath, file));
                        if (menu.customId && menu.execute) {
                            this.selectMenus.set(menu.customId, menu);
                            console.log(`[SELECT MENU] ${menu.customId} loaded`);
                        }
                    } catch (error) {
                        console.error(`[ERROR] Failed to load select menu ${file}:`, error);
                    }
                }
            }
            
            // Load modals
            const modalsPath = path.join(interactionsPath, 'modals');
            if (fs.existsSync(modalsPath)) {
                const modalFiles = fs.readdirSync(modalsPath).filter(f => f.endsWith('.js'));
                
                for (const file of modalFiles) {
                    try {
                        const modal = require(path.join(modalsPath, file));
                        if (modal.customId && modal.execute) {
                            this.modals.set(modal.customId, modal);
                            console.log(`[MODAL] ${modal.customId} loaded`);
                        }
                    } catch (error) {
                        console.error(`[ERROR] Failed to load modal ${file}:`, error);
                    }
                }
            }
        }
    }
}

// Initialize and start the bot
const client = new TokomiClient();
client.initialize();

// Error handling
process.on('unhandledRejection', error => {
    console.error('[UNHANDLED REJECTION]', error);
});

process.on('uncaughtException', error => {
    console.error('[UNCAUGHT EXCEPTION]', error);
    process.exit(1);
});
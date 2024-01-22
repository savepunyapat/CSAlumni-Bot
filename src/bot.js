require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const client = new Client({
    intents:[
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (message) => {
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

client.login(process.env.TOKEN);
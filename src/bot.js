require('dotenv').config();

const { Client , GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ] 
    });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
client.on('messageCreate', msg => {
    console.log(msg.content);
    if (msg.content === 'ping') {
        msg.reply('Pong!');
    }
});
client.login(process.env.TOKEN);
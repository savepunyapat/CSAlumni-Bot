require('dotenv').config();
const mongoose = require('mongoose');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
});

mongoose.connect(process.env.MONGO_URL, { userNewUrlParser:true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error',console.error.bind(console,'MongoDB connection error!'));
db.once('open',()=>{
    console.log('Connected to MongoDB')
});

const PREFIX = '!'; // Command prefix
const joinCommand = 'join'; // The command to initiate the join process
const joinCode = '123456'; // The required code to join
const allowedRole = 'Member'; // Replace with the name of the role you want to assign upon joining

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (msg) => {
    // Ignore messages from bots or messages that don't start with the prefix
    if (msg.author.bot || !msg.content.startsWith(PREFIX)) return;

    const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === joinCommand) {
        // Check if the user has already joined
        if (msg.member.roles.cache.some((role) => role.name === allowedRole)) {
            return msg.reply('You are already a member!');
        }

        // Check if the user has a DM channel
        if (!msg.author.dmChannel) {
            await msg.author.createDM();
        }

        // Send a private message to the user with the join code
        const dmChannel = await msg.author.createDM();
        dmChannel.send(`To join the server, please reply with the following code: ${joinCode}`);

        // Listen for the user's response in the DM channel
        const filter = (response) => response.author.id === msg.author.id;
        dmChannel
            .awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
            .then((collected) => {
                const userResponse = collected.first().content;
                console.log(userResponse);

                // Check if the user's response matches the required code
                if (userResponse === joinCode) {
                    // Grant the user the desired role
                    const role = msg.guild.roles.cache.find((role) => role.name === allowedRole);

                    if (!role) {
                        return console.error(`Role '${allowedRole}' not found.`);
                    }

                    try {
                        msg.member.roles.add(role);
                        dmChannel.send(`Welcome! You have joined the server as ${allowedRole}.`);
                    } catch (error) {
                        console.error(error);
                        dmChannel.send('There was an error while processing your request.');
                    }
                } else {
                    dmChannel.send('Invalid code. Please try again.');
                }
            })
            .catch(() => {
                dmChannel.send('Time ran out. Please initiate the join process again.');
            });
    }
});

client.login(process.env.TOKEN).catch((error) => console.error(`Error during login: ${error}`));

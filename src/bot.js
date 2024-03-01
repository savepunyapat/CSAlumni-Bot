require("dotenv").config();
const mongoose = require("mongoose");
const { Client, GatewayIntentBits, version, Partials ,Intents, EmbedBuilder  } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions,
  ],
});

mongoose.connect(process.env.MONGO_URL, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error!"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const PREFIX = "!";
const joinCommand = "join";
const allowedRolesMap = {
  98765432: "60",
  23456789: "61",
  87654321: "62",
  12345678: "63",
  98761234: "64",
  34567890: "65",
  56789012: "66",
  10987654: "67",
  99999999: "68",
};

const userSchema = new mongoose.Schema({
  Email: String,
  Password: String,
  FirstName: String,
  LastName: String,
  PhoneNumber: String,
  Address: String,
  StdID: String,
  Education: Array,
  WorkPlace: Array,
  Permission: String,
  Birthday: String,
});

const Model = mongoose.model("AlumniAccount", userSchema);
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("guildMemberAdd", async (member) => {
  const guildId = "1184077351970144256";
  const guild = await client.guilds.fetch(guildId);

  if (!guild) {
    console.error("Guild not found.");
    return;
  }

  const fetchedMember = await guild.members.fetch(member.id);

  if (!fetchedMember) {
    console.error("Member not found in the guild.");
    return;
  }

  const dmChannel = await fetchedMember.createDM();
  dmChannel.send(
    "Welcome to the server! To join, please use the KEY you got from the website. ."
  );
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "getdata") {
    console.log("getdata");
    try {
      const response = await Model.find({});
      console.log("completed");
      console.log(response[0].Email);
    } catch (error) {
      console.error("Error retrieving data:", error);
      msg.reply("An error occurred while retrieving data.");
    }
  }
  if (command === joinCommand) {
    const memberRoles = msg.member.roles.cache.map((role) => role.name);

    if (
      Object.values(allowedRolesMap).some((role) => memberRoles.includes(role))
    ) {
      return msg.reply("You are already a member!");
    }

    if (!msg.author.dmChannel) {
      await msg.author.createDM();
    }

    const dmChannel = await msg.author.createDM();
    dmChannel.send(
      `To join the server, please reply with your verify code!`
    );

    try {
      const collected = await dmChannel.awaitMessages({
        filter: (response) => response.author.id === msg.author.id,
        max: 1,
        time: 60000,
        errors: ["time"],
      });

      const userResponse = collected.first().content;

      if (userResponse in allowedRolesMap) {
        const role = allowedRolesMap[userResponse];
        assignRoleAndSendWelcome(msg, role, dmChannel);
      } else {
        dmChannel.send("Invalid code. Please try again.");
      }
    } catch (error) {
      dmChannel.send("Time ran out. Please initiate the join process again.");
    }
  }

  
if(msg.content.startsWith('!command')) {

  return msg.reply('Command not found.');
}try {
    channel.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        msg.reply('There was an error executing that command.');
    }

});






function assignRoleAndSendWelcome(msg, role, dmChannel) {
  const roleObj = msg.guild.roles.cache.find((r) => r.name === role);

  if (!roleObj) {
    return console.error(`Role '${role}' not found.`);
  }

  try {
    msg.member.roles.add(roleObj);
    dmChannel.send(`Welcome! You have joined the server as ${role}.`);
  } catch (error) {
    console.error(error);
    dmChannel.send("There was an error while processing your request.");
  }
}

client
  .login(process.env.TOKEN)
  .catch((error) => console.error(`Error during login: ${error}`));

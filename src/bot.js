require("dotenv").config();
const mongoose = require("mongoose");
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
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
const joinCode = "123456";
const allowedRole = "Member";

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

client.on("messageCreate", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "getdata") {
    console.log("getdata");
    try {
      const response = await Model.find({});

      console.log("completed");
      console.log(response[0].Email);
      /*
      response.forEach((res) => {
        if (res) {
          msg.reply(`User Email: ${res}`);
        } else {
          console.error("User email is empty or undefined.");
        }
      });*/
    } catch (error) {
      console.error("Error retrieving data:", error);
      msg.reply("An error occurred while retrieving data.");
    }
  }

  if (command === joinCommand) {
    if (msg.member.roles.cache.some((role) => role.name === allowedRole)) {
      return msg.reply("You are already a member!");
    }

    if (!msg.author.dmChannel) {
      await msg.author.createDM();
    }

    const dmChannel = await msg.author.createDM();
    dmChannel.send(
      `To join the server, please reply with the following code: ${joinCode}`
    );
    const filter = (response) => response.author.id === msg.author.id;
    dmChannel
      .awaitMessages({ filter, max: 1, time: 60000, errors: ["time"] })
      .then((collected) => {
        const userResponse = collected.first().content;
        console.log(userResponse);

        if (userResponse === joinCode) {
          const role = msg.guild.roles.cache.find(
            (role) => role.name === allowedRole
          );

          if (!role) {
            return console.error(`Role '${allowedRole}' not found.`);
          }

          try {
            msg.member.roles.add(role);
            dmChannel.send(
              `Welcome! You have joined the server as ${allowedRole}.`
            );
          } catch (error) {
            console.error(error);
            dmChannel.send("There was an error while processing your request.");
          }
        } else {
          dmChannel.send("Invalid code. Please try again.");
        }
      })
      .catch(() => {
        dmChannel.send("Time ran out. Please initiate the join process again.");
      });
  }
});

client
  .login(process.env.TOKEN)
  .catch((error) => console.error(`Error during login: ${error}`));

const { Client, IntentsBitField, Partials } = require("discord.js");
const data = new Client({ intents: [
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.MessageContent,
  IntentsBitField.Flags.DirectMessages
  ],
  'partials': [Partials.Channel] 
});
data.on('ready', (c) => {
  console.log(`${c.user.tag} is ready`);
});
data.login(process.env.NEWT_TOKEN)

module.exports = data;
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const kfs = require("key-file-storage");
const historyLength = 10;

const OpenAI = require("openai");
const openai = new OpenAI();

const { Client, IntentsBitField, Partials } = require("discord.js");
const newt = new Client({ intents: [
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.MessageContent,
  IntentsBitField.Flags.DirectMessages
  ],
  'partials': [Partials.Channel] 
});
const jacob = new Client({ intents: [
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.MessageContent,
  IntentsBitField.Flags.DirectMessages
  ],
  'partials': [Partials.Channel] 
});


newt.on('ready', (c) => {
  console.log(`${c.user.tag} is ready`);
});

newt.on('messageCreate', async(message) => {
  if (message.author.bot) {
    return;
  }
  
  await processMessage(message, 'newt', process.env.NEWT_BOT_ID);
});

jacob.on('ready', (c) => {
  console.log(`${c.user.tag} is ready`);
});

jacob.on('messageCreate', async(message) => {
  if (message.author.bot) {
    return;
  }
  
  await processMessage(message, 'jacob', process.env.JACOB_BOT_ID);
});

async function processMessage(message, name, bot_id) {
  if (message.mentions.users.get(bot_id)) {
    const response = await generateResponse(message.content.replace(/ *\<[^)]*\> */g, ""), message.channelId, name);
    message.reply(response.message.content);
  }
  else if (message.guildId == null) {
    const response = await generateResponse(message.content.replace(/ *\<[^)]*\> */g, ""), message.channelId, name);
    message.reply(response.message.content);
  }
}

async function generateResponse(message, channelId, name) {
  const prompt = require(`./prompts/${name}.js`);
  const store = kfs(`./db/${name}-db`);

  let messages = [];
  let chatHistory = [];
  let userMessage = {
    role: 'user',
    content: message,
  };
  messages.push(prompt);
  console.log(message);
  console.log("Processing...");
  if(store[channelId]){
  	console.log("History is available");
  	chatHistory = store[channelId];
  }
  messages = messages.concat(chatHistory);
  messages.push(userMessage);
  const completion = await openai.chat.completions.create({
    // Important
    messages: messages,
    model: "gpt-3.5-turbo",
    // Important
    max_tokens: 256,
    temperature: 0.5,
    top_p: 1,
    n: 1,
    presence_penalty: 0.25,
    frequency_penalty: 0.1
  });
  console.log("Generated!");
  if(completion.usage.completion_tokens <= 100){
    console.log("Saved!");
    chatHistory.push(userMessage, completion.choices[0].message);
  }
  store[channelId] = chatHistory.slice(-historyLength);
  return completion.choices[0];
}

newt.login(process.env.NEWT_TOKEN)
jacob.login(process.env.JACOB_TOKEN)
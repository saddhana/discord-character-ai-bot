const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const newt = require(`./model/newt.js`);
const jacob = require(`./model/jacob.js`);
const messageService = require(`./service/message.js`);

newt.on('messageCreate', async(message) => {
  if (message.author.bot) {
    return;
  }
  await messageService.processMessage(message, 'newt', process.env.NEWT_BOT_ID);
});

jacob.on('messageCreate', async(message) => {
  if (message.author.bot) {
    return;
  }
  await messageService.processMessage(message, 'jacob', process.env.JACOB_BOT_ID);
});
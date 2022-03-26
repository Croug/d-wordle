const { Client, Intents, Interaction, MessageEmbed } = require('discord.js');
const { TOKEN } = require('../config.json');
const Wordle = require('./wordle');
const CreateBoard = require('./wordle-board')

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const commands = {}
const games = {}

client.once('ready', ()=>{
  console.log('Logged in as ' + client.user.tag);
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  await commands[interaction.commandName](interaction);
})

client.on('messageCreate', async message => {
  if (!message.channel.isThread()) return
  if (!games[message.channel.id]) return
  if (message.author.bot) return

  let del = await games[message.channel.id].onGuess(message);
  if(del) delete games[message.channel.id];
})

client.on('threadDelete', async thread => {
  if(thread.id in games) delete games[thread.id]
})

/**
 * 
 * @param {Interaction<import('discord.js').CacheType} interaction 
 */
commands.wordle = async interaction => {
  if(!interaction.isCommand) return;

  let source = interaction.channel;

  if(interaction.channel.threads) {
    source = await interaction.channel.threads.create({
      name: `${interaction.user.username}'s wordle`,
      autoArchiveDuration: 60,
      reason: 'Wordle game'
    })

    source.members.add(interaction.user.id)
  }

  games[source.id] = new Wordle(source);

  interaction.reply('Wordle game started');
}

client.login(TOKEN);
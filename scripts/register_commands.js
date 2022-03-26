#!/usr/bin/env node

const { SlashCommandBuilder } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { TOKEN, CLIENT, DEV_GUILD } = require('../config.json')
const yargs = require('yargs')

let guild = null

const args = yargs
  .option('dev', {
    alias: 'd',
    default: false,
    type: 'boolean'
  }).argv

const body = [ new SlashCommandBuilder().setName('wordle').setDescription('Start a wordle game').toJSON() ]

const rest = new REST({ version: '9' }).setToken(TOKEN)

route = args.dev ?
        Routes.applicationGuildCommands(CLIENT, DEV_GUILD) :
        Routes.applicationCommands(CLIENT) 

rest.put(route, { body })
  .then(() => console.log('Added command'))
  .catch(console.error)
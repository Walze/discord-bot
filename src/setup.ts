import { Client } from 'discord.js'
import Commands from './bot/classes/Commands'
import { log } from 'console'

const client = new Client()

import config from '../config.json'

client.login(config.token)

// Restart
client.on('error', () => client.login(config.token))
client.on('disconnect', () => client.login(config.token))

client.on('ready', () => {
  client.user.setActivity('s-help')

  Commands.log()

  log('Bot Ready\n')
})

// Error Handling
process.on('unhandledRejection', (_, promise) => {
  console.error('!!!!! unhandle_rejection !!!!!'.toUpperCase())

  promise.catch(console.error)
})

export default client

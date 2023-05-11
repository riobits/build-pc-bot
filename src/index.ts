import 'dotenv/config'
import { Telegraf } from 'telegraf'
import scraper from './scraper'

if (!process.env.BOT_TOKEN) {
  console.error('BOT_TOKEN is required!')
  process.exit(1)
}

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.command('pc', async (ctx) => {
  const commandText = ctx.message.text
  const budget = commandText.split(' ')[1]

  if (!budget) {
    await ctx.reply(
      'Please provide a budget!\nExample: /pc $1000, /pc $1000-1600'
    )
    return
  }

  await scraper(budget, ctx)
})

bot.launch()

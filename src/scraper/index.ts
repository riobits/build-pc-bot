import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import newegg from './newegg'
import akace from './akace'

puppeteer.use(StealthPlugin())

const scraper = async (budget: string, ctx: any) => {
  const browser = await puppeteer.launch({
    headless: true,
    // headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36`,
    ],
  })
  await ctx.reply('Getting parts from newegg AI (Building PC)..')

  // Get pc parts from newegg AI
  const parts = await newegg(browser, budget, ctx)

  if (!parts) {
    await ctx.reply('Error while getting parts from newegg AI')
    return
  }

  await ctx.reply('Getting parts prices from akace..')

  // Get prices from akace
  const itemsInfo = await akace(browser, parts.parts)

  if (!itemsInfo) {
    await ctx.reply('Error while getting parts prices from akace')
    return
  }

  let message = '<b>Items from newegg AI</b>\n\n'

  parts.parts.forEach((part) => {
    message += `🟢 ${part.title}\n➕ ${part.price}\n\n`
  })

  message += `<b>💲  Total: ${parts.totalPrice}</b>\n\n`

  await ctx.reply(message, {
    parse_mode: 'HTML',
  })

  message = '<b>Items from akace (cheapest price possible)</b>\n\n'

  itemsInfo.itemsInfo.forEach((item) => {
    message += `🟢 ${item.title}\n\n➕ ₺${item.price}\n\n`
  })

  message += `<b>Total: ₺${itemsInfo.totalPrice}</b>`

  await ctx.reply(message, {
    parse_mode: 'HTML',
  })

  await browser.close()
}

export default scraper

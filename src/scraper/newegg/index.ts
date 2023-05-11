import type { Browser } from 'puppeteer'

const URL = 'https://www.newegg.com/tools/custom-pc-builder'

const newegg = async (browser: Browser, budget: string, ctx: any) => {
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1080, height: 1024 })

    await page.goto(URL)
    await page.waitForNetworkIdle()

    const closeIcon = await page.waitForSelector('#changeCountry > .menu-close')
    closeIcon?.click()

    // Searching for parts
    const searchInput = await page.waitForSelector('input[aria-label="Search"]')
    const searchButton = await page.waitForSelector(
      'button[aria-label="search"]'
    )

    if (!searchInput) throw new Error('Search input not found')
    if (!searchButton) throw new Error('Search button not found')

    await searchInput.type(`pc for playing games, price ${budget}`)
    await searchButton.click()

    await ctx.reply('Searching for pc parts..')

    const modalHeader = await page.waitForSelector('.modal-header')

    if (!modalHeader) throw new Error('Modal header not found')

    await page.waitForSelector(
      '.modal-body > .item-cells-groups > .item-cells-group > .item-cells > .scrollbar',
      {
        timeout: 50000,
      }
    )

    // Getting Price
    const totalPriceEl = await page.waitForSelector(
      '.item-cell-action-price > .price > .price-current'
    )

    if (!totalPriceEl) throw new Error('Price element not found')

    const totalPrice = await totalPriceEl.evaluate((node) => node.textContent)

    // Getting Parts
    const parts = await modalHeader.evaluate((node) =>
      [
        ...node.parentElement!.querySelector(
          '.modal-body > .item-cells-groups > .item-cells-group > .item-cells > .scrollbar'
        )!.children,
      ].map((el) => {
        const item = el.querySelector('.item-container')!
        const title = item.querySelector('.item-info')!.textContent || ''
        const price = item.querySelector('.item-action')!.textContent || ''
        return {
          title,
          price,
        }
      })
    )

    await page.close()

    return { totalPrice, parts }
  } catch (err) {
    console.error(err)
  }
}

export default newegg

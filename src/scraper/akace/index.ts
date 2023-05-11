import type { Browser } from 'puppeteer'

interface Item {
  title: string
  price: string
}

interface ItemInfo {
  title: string
  price: number
}

const URL = 'https://www.akakce.com'

const getItemInfo = async (browser: Browser, item: Item) => {
  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1024 })

  const searchText = item.title
  await page.goto(`${URL}/arama/?q=${searchText}`)

  const itemPrice = await page.waitForSelector(
    '#APL > li:nth-child(1) > div > ul > li.b > a > span > span'
  )

  const itemTitle = await page.waitForSelector(
    '#APL > li:nth-child(1) > a > span > h3'
  )

  if (!itemPrice) throw new Error('Item price not found')
  if (!itemTitle) throw new Error('Item title not found')

  const itemTitleString = await itemTitle.evaluate(
    (node) => node.textContent || ''
  )
  const priceString = await itemPrice.evaluate((node) => node.textContent)
  const priceNumber = parseFloat(
    priceString!.replace('.', '').replace(',', '.')
  )

  return {
    title: itemTitleString,
    price: priceNumber,
  }
}

const akace = async (browser: Browser, parts: Item[]) => {
  try {
    let totalPrice = 0
    const itemsInfo: ItemInfo[] = []
    for (const item of parts) {
      const itemInfo = await getItemInfo(browser, item)
      itemsInfo.push(itemInfo)
      totalPrice += itemInfo.price
    }

    return { totalPrice: totalPrice.toFixed(2), itemsInfo }
  } catch (err) {
    console.error(err)
  }
}

export default akace

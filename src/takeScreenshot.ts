import puppeteer from 'puppeteer'

export default async function takeScreenshot(url: string): Promise<Buffer> {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(url)

  const content = await page.screenshot({fullPage: true})

  await browser.close()

  return content as Buffer
}

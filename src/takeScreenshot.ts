import {webkit} from 'playwright'

export default async function takeScreenshot(url: string): Promise<Buffer> {
  const browser = await webkit.launch()
  const page = await browser.newPage()

  await page.goto(url)
  const content = await page.screenshot({
    fullPage: true
  })
  await browser.close()

  return content
}

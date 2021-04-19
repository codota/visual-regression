import os from 'os'
import path from 'path'
import puppeteer from 'puppeteer'

export default async function takeScreenshot(url: string): Promise<Buffer> {
  const browser = await puppeteer.launch({executablePath: getChromePath()})
  const page = await browser.newPage()

  await page.goto(url)

  const content = await page.screenshot({fullPage: true})

  await browser.close()

  return content as Buffer
}

function getChromePath(): string {
  let browserPath

  if (os.type() === 'Windows_NT') {
    // Chrome is usually installed as a 32-bit application, on 64-bit systems it will have a different installation path.
    const programFiles =
      os.arch() === 'x64'
        ? process.env['PROGRAMFILES(X86)']
        : process.env.PROGRAMFILES
    browserPath = path.join(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      programFiles!,
      'Google/Chrome/Application/chrome.exe'
    )
  } else if (os.type() === 'Linux') {
    browserPath = '/usr/bin/google-chrome'
  } else if (os.type() === 'Darwin') {
    browserPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }

  if (browserPath && browserPath.length > 0) {
    return path.normalize(browserPath)
  }

  throw new TypeError(`Cannot run action. ${os.type} is not supported.`)
}

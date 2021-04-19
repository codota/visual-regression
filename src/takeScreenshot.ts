import * as core from '@actions/core'
import os from 'os'
import path from 'path'
import puppeteer from 'puppeteer-core'

export default async function takeScreenshot(
  url: string,
  filePath: string
): Promise<void> {
  core.info(`Taking screenshot of ${url}. Starting by launching Puppeteer.`)

  const browser = await puppeteer.launch({executablePath: getChromePath()})
  core.info(`New Page.`)
  const page = await browser.newPage()

  core.info(`Launched Puppeteer, goto ${url}`)
  await page.goto(url)

  core.info(`Taking screenshot..`)
  await page.screenshot({path: filePath, fullPage: true})

  core.info(`Took screenshot, closing broswer`)
  await browser.close()
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

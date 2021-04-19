import * as core from '@actions/core'
import * as github from '@actions/github'
import slackMessage from './slackMessage'
import takeScreenshot from './takeScreenshot'
import {getType} from 'mime'
import fs from 'fs/promises'

const SCREENSHOT_TEMP_FILE_PATH = 'screenshot.png'

async function run(): Promise<void> {
  try {
    const {owner, repo} = github.context.repo
    const slackWebhook: string = core.getInput('slackWebhook')
    const githubToken = core.getInput('githubToken')
    const url = core.getInput('url')
    const octokit = github.getOctokit(githubToken)

    core.info(`Running from dir: ${__dirname}`)
    // await fs.copyFile(
    //   `${__dirname}/../browsers.json`,
    //   `${__dirname}/browsers.json`
    // )
    // core.info(`Copied file successfully`)

    await takeScreenshot(url, SCREENSHOT_TEMP_FILE_PATH)

    core.info(`Took screenshot`)

    const [latest, previous] = (
      await octokit.repos.listReleases({owner, repo})
    ).data.filter(({draft, prerelease}) => !draft && !prerelease)

    const latestReleaseVersion = latest.tag_name.replace('v', '')
    const previousReleaseVersion = previous.tag_name.replace('v', '')

    core.info(
      `Receieved Releases. Latest is ${latestReleaseVersion} and previous is ${previousReleaseVersion}`
    )

    const fileMime =
      getType(SCREENSHOT_TEMP_FILE_PATH) || 'application/octet-stream'
    const charset: 'utf-8' | null =
      fileMime.indexOf('text') > -1 ? 'utf-8' : null

    const headers = {
      'content-type': fileMime,
      'content-length': (await fs.stat(SCREENSHOT_TEMP_FILE_PATH)).size
    }

    const uploadedAsset = await octokit.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: latest.id,
      headers,
      name: `screenshot.png`,
      data: ((await fs.readFile(
        SCREENSHOT_TEMP_FILE_PATH,
        charset
      )) as unknown) as string
    })

    core.info(
      `Uploaded screenshot as a release asset to v${latestReleaseVersion}. Download url is: ${uploadedAsset.data.browser_download_url}`
    )

    await slackMessage(
      slackWebhook,
      latestReleaseVersion,
      previousReleaseVersion,
      uploadedAsset.data.browser_download_url,
      `https://github.com/${owner}/${repo}/releases/download/v${previousReleaseVersion}/screenshot.png`
    )
    core.info(`Sent Slack message successfully.`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

import * as core from '@actions/core'
import * as github from '@actions/github'
import imageUrl from './imageUrl'
import slackMessage from './slackMessage'
import takeScreenshot from './takeScreenshot'
import uploadImageToRelease from './uploadImageToRelease'
import {compareImages} from 'resemblejs'
import fs from 'fs'

const SCREENSHOT_FILE_NAME = 'screenshot'

async function run(): Promise<void> {
  try {
    const {owner, repo} = github.context.repo
    const slackWebhook: string = core.getInput('slackWebhook')
    const githubToken = core.getInput('githubToken')
    const url = core.getInput('url')
    const octokit = github.getOctokit(githubToken)

    const screenshot_file_name = `${SCREENSHOT_FILE_NAME}.png`

    await takeScreenshot(url, screenshot_file_name)

    core.info(`Fetching releases for ${owner}/${repo}`)

    const [latest, previous] = (
      await octokit.repos.listReleases({owner, repo})
    ).data.filter(({draft, prerelease}) => !draft && !prerelease)

    const latestReleaseVersion = latest.tag_name.replace('v', '')
    const previousReleaseVersion = previous?.tag_name.replace('v', '')

    core.info(
      `Receieved Releases. Latest is ${latestReleaseVersion} and previous is ${previousReleaseVersion}`
    )

    await uploadImageToRelease({
      octokit,
      release_id: latest.id,
      name: screenshot_file_name,
      filepath: screenshot_file_name
    })

    const latestReleaseScreenshot = imageUrl(
      latestReleaseVersion,
      screenshot_file_name
    )
    const previousReleaseScreenshot = imageUrl(
      previousReleaseVersion,
      screenshot_file_name
    )

    core.info(
      `Uploaded screenshot as a release asset to v${latestReleaseVersion}. Download url is: ${latestReleaseScreenshot}`
    )

    core.info(`Creating diff between latest version and previous version`)
    const diff = await compareImages(
      fs.readFileSync(latestReleaseScreenshot),
      fs.readFileSync(previousReleaseScreenshot),
      {}
    )

    const diffFileName = `diff-${SCREENSHOT_FILE_NAME}.png`

    core.info(`Writing diff mask as image to ${diffFileName}`)
    fs.writeFileSync(diffFileName, diff.getBuffer())

    await uploadImageToRelease({
      octokit,
      release_id: latest.id,
      name: diffFileName,
      filepath: diffFileName
    })

    await slackMessage(
      slackWebhook,
      latestReleaseVersion,
      previousReleaseVersion,
      latestReleaseScreenshot,
      previousReleaseScreenshot,
      imageUrl(latestReleaseVersion, diffFileName)
    )
    core.info(`Sent Slack message successfully.`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

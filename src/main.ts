import * as core from '@actions/core'
import * as github from '@actions/github'
import imageUrl from './imageUrl'
import slackMessage from './slackMessage'
import takeScreenshot from './takeScreenshot'
import uploadImageToRelease from './uploadImageToRelease'
import createReleasesDiff from './createReleasesDiff'
import findLatestReleases from './findLatestReleases'

const SCREENSHOT_FILE_NAME = 'screenshot'

async function run(): Promise<void> {
  try {
    const {owner, repo} = github.context.repo
    const slackWebhook: string = core.getInput('slackWebhook')
    const githubToken = core.getInput('githubToken')
    const url = core.getInput('url')
    const screenshotFileNameRaw =
      core.getInput('screenshotFilename') || SCREENSHOT_FILE_NAME
    const octokit = github.getOctokit(githubToken)
    const screenshotFileName = `${screenshotFileNameRaw}.png`

    await takeScreenshot(url, screenshotFileName)

    core.info(`Fetching releases for ${owner}/${repo}`)

    const {
      latestReleaseVersion,
      previousReleaseVersion,
      latestReleaseId
    } = await findLatestReleases(octokit)

    core.info(
      `Receieved Releases. Latest is ${latestReleaseVersion} and previous is ${previousReleaseVersion}`
    )
    await uploadImageToRelease({
      octokit,
      release_id: latestReleaseId,
      name: screenshotFileName,
      filepath: screenshotFileName
    })
    core.info(
      `Uploaded screenshot as a release asset to v${latestReleaseVersion}. Download url is: ${imageUrl(
        latestReleaseVersion,
        screenshotFileName
      )}`
    )

    if (!previousReleaseVersion) {
      core.warning('Did not find previous releases, stopping here.')

      return
    }

    await createReleasesDiff(
      octokit,
      latestReleaseId,
      previousReleaseVersion,
      screenshotFileName
    )
    core.info(`Uploaded diff mask as image to latest release`)
    await slackMessage(
      slackWebhook,
      latestReleaseVersion,
      previousReleaseVersion,
      screenshotFileName
    )
    core.info(`Sent Slack message successfully.`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

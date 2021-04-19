import * as core from '@actions/core'
import * as github from '@actions/github'
import slackMessage from './slackMessage'
import takeScreenshot from './takeScreenshot'

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

    const latestReleaseScreenshot = await takeScreenshot(url)

    core.info(`Took screenshot`)

    const [latest, previous] = (
      await octokit.repos.listReleases({owner, repo})
    ).data.filter(({draft, prerelease}) => !draft && !prerelease)

    const latestReleaseVersion = latest.tag_name.replace('v', '')
    const previousReleaseVersion = previous.tag_name.replace('v', '')

    core.info(
      `Receieved Releases. Latest is ${latestReleaseVersion} and previous is ${previousReleaseVersion}`
    )

    const uploadedAsset = await octokit.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: latest.id,
      name: `screenshot-${url}.png`,
      data: latestReleaseScreenshot.toString('base64')
    })

    core.info(
      `Uploaded screenshot as a release asset to v${latestReleaseVersion}. Download url is: ${uploadedAsset.data.browser_download_url}`
    )

    await slackMessage(
      slackWebhook,
      latestReleaseVersion,
      previousReleaseVersion,
      uploadedAsset.data.browser_download_url,
      `https://github.com/${owner}/${repo}/releases/download/v${previousReleaseVersion}/screenshot-${url}.png`
    )
    core.info(`Sent Slack message successfully.`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

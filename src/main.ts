import * as core from '@actions/core'
import * as github from '@actions/github'
import slackMessage from './slackMessage'
import takeScreenshot from './takeScreenshot'
import fs from 'fs/promises'

async function run(): Promise<void> {
  try {
    const {owner, repo} = github.context.repo
    const slackWebhook: string = core.getInput('slackWebhook')
    const githubToken = core.getInput('githubToken')
    const url = core.getInput('url')
    const octokit = github.getOctokit(githubToken)

    core.info(`__dirname: ${__dirname}`)
    // await fs.copyFile(
    //   `${__dirname}/../browsers.json`,
    //   `${__dirname}/browsers.json`
    // )
    // core.info(`Copied file successfully`)

    const latestReleaseScreenshot = await takeScreenshot(url)

    const [latest, previous] = (
      await octokit.repos.listReleases({owner, repo})
    ).data.filter(({draft, prerelease}) => !draft && !prerelease)

    const latestReleaseVersion = latest.tag_name.replace('v', '')
    const previousReleaseVersion = previous.tag_name.replace('v', '')

    await octokit.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: latest.id,
      name: `screenshot-${url}.png`,
      data: latestReleaseScreenshot.toString()
    })

    await slackMessage(
      slackWebhook,
      latestReleaseVersion,
      previousReleaseVersion,
      `https://github.com/${owner}/${repo}/releases/download/v${latestReleaseVersion}/screenshot-${url}.png`,
      `https://github.com/${owner}/${repo}/releases/download/v${previousReleaseVersion}/screenshot-${url}.png`
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

import * as core from '@actions/core'
import {IncomingWebhook} from '@slack/webhook'
import diffFileName from './diffFileName'
import imageUrl from './imageUrl'

export default async function slackMessage(
  slackWebhook: string,
  latestReleaseVersion: string,
  previousReleaseVersion: string,
  screenshotFileName: string
): Promise<void> {
  const webhook = new IncomingWebhook(slackWebhook)

  core.info(`Posting to slack using IncomingWebhook`)
  await webhook.send({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `# Visual Comparison v${latestReleaseVersion}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Released Version*'
        }
      },
      {
        type: 'image',
        title: {
          type: 'plain_text',
          text: `v${latestReleaseVersion}`,
          emoji: true
        },
        image_url: imageUrl(latestReleaseVersion, screenshotFileName),
        alt_text: `Version ${latestReleaseVersion}`
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Previous Version*'
        }
      },
      {
        type: 'image',
        title: {
          type: 'plain_text',
          text: `v${previousReleaseVersion}`,
          emoji: true
        },
        image_url: imageUrl(previousReleaseVersion, screenshotFileName),
        alt_text: `Version ${previousReleaseVersion}`
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Diff between versions*'
        }
      },
      {
        type: 'image',
        title: {
          type: 'plain_text',
          text: `Diff mask`,
          emoji: true
        },
        image_url: imageUrl(
          latestReleaseVersion,
          diffFileName(screenshotFileName)
        ),
        alt_text: `Difference mask`
      }
    ]
  })
}

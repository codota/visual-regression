import * as core from '@actions/core'
import {IncomingWebhook} from '@slack/webhook'

export default async function slackMessage(
  slackWebhook: string,
  latestReleaseVersion: string,
  previousReleaseVersion: string,
  latestReleaseScreenshot: string,
  previousReleaseScreenshot: string,
  diffScreenshot: string
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
        image_url: latestReleaseScreenshot,
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
        image_url: previousReleaseScreenshot,
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
        image_url: diffScreenshot,
        alt_text: `Difference mask`
      }
    ]
  })
}

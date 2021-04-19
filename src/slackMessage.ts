import * as core from '@actions/core'
import {IncomingWebhook} from '@slack/webhook'

export default async function slackMessage(
  slackWebhook: string,
  latestReleaseVersion: string,
  previousReleaseVersion: string,
  latestReleaseScreenshot: string,
  previousReleaseScreenshot: string
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
        image_url:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Fuyu_Persimmon_%28Diospyros_Kaki%29.jpg/1200px-Fuyu_Persimmon_%28Diospyros_Kaki%29.jpg',
        // image_url: latestReleaseScreenshot,
        alt_text: `Version ${latestReleaseVersion}`
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Previous Version*'
        }
      }
      // {
      //   type: 'image',
      //   title: {
      //     type: 'plain_text',
      //     text: `v${previousReleaseVersion}`,
      //     emoji: true
      //   },
      //   image_url: previousReleaseScreenshot,
      //   alt_text: `Version ${previousReleaseVersion}`
      // }
    ]
  })
}

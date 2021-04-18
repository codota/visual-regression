import {IncomingWebhook} from '@slack/webhook'

export default async function slackMessage(
  slackWebhook: string,
  latestReleaseVersion: string,
  previousReleaseVersion: string,
  latestReleaseScreenshot: string,
  previousReleaseScreenshot: string
): Promise<void> {
  const webhook = new IncomingWebhook(slackWebhook)

  await webhook.send({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Visual Comparison*'
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
      }
    ]
  })
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const webhook_1 = require("@slack/webhook");
function slackMessage(slackWebhook, latestReleaseVersion, previousReleaseVersion, latestReleaseScreenshot, previousReleaseScreenshot) {
    return __awaiter(this, void 0, void 0, function* () {
        const webhook = new webhook_1.IncomingWebhook(slackWebhook);
        yield webhook.send({
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
        });
    });
}
exports.default = slackMessage;

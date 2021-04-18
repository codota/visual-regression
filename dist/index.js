"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const slackMessage_1 = __importDefault(require("./slackMessage"));
const takeScreenshot_1 = __importDefault(require("./takeScreenshot"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { owner, repo } = github_1.default.context.repo;
            const slackWebhook = core.getInput('slackWebhook');
            const githubToken = core.getInput('githubToken');
            const url = core.getInput('url');
            const octokit = github_1.default.getOctokit(githubToken);
            core.info(`__dirname: ${__dirname}`);
            // await fs.copyFile(
            //   `${__dirname}/../browsers.json`,
            //   `${__dirname}/browsers.json`
            // )
            // core.info(`Copied file successfully`)
            const latestReleaseScreenshot = yield takeScreenshot_1.default(url);
            const [latest, previous] = (yield octokit.repos.listReleases({ owner, repo })).data.filter(({ draft, prerelease }) => !draft && !prerelease);
            const latestReleaseVersion = latest.tag_name.replace('v', '');
            const previousReleaseVersion = previous.tag_name.replace('v', '');
            yield octokit.repos.uploadReleaseAsset({
                owner,
                repo,
                release_id: latest.id,
                name: `screenshot-${url}.png`,
                data: latestReleaseScreenshot.toString()
            });
            yield slackMessage_1.default(slackWebhook, latestReleaseVersion, previousReleaseVersion, `https://github.com/${owner}/${repo}/releases/download/v${latestReleaseVersion}/screenshot-${url}.png`, `https://github.com/${owner}/${repo}/releases/download/v${previousReleaseVersion}/screenshot-${url}.png`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();

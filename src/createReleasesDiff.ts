import * as core from '@actions/core'
import {GitHub} from '@actions/github/lib/utils'
import axios from 'axios'
import fs from 'fs'
import pixelmatch from 'pixelmatch'
import {PNG} from 'pngjs'
import diffFileName from './diffFileName'
import imageUrl from './imageUrl'
import uploadImageToRelease from './uploadImageToRelease'

export default async function createReleasesDiff(
  octokit: InstanceType<typeof GitHub>,
  latestReleaseId: number,
  previousReleaseVersion: string,
  screenshotFileName: string
): Promise<void> {
  core.info(
    `Downloading previous release screenshot from: ${imageUrl(
      previousReleaseVersion,
      screenshotFileName
    )}`
  )

  const {data: previousVersionScreenshot} = await axios.get(
    imageUrl(previousReleaseVersion, screenshotFileName),
    {
      responseType: 'arraybuffer'
    }
  )

  core.info(`Creating diff between latest version and previous version`)
  const {width, height, data: latestScreenshotPngData} = PNG.sync.read(
    fs.readFileSync(screenshotFileName)
  )
  const previousScreenshotPng = PNG.sync.read(
    Buffer.from(previousVersionScreenshot, 'binary')
  )
  const diff = new PNG({width, height})

  pixelmatch(
    latestScreenshotPngData,
    previousScreenshotPng.data,
    diff.data,
    width,
    height,
    {
      threshold: 0.01
    }
  )

  const diffFile = diffFileName(screenshotFileName)

  core.info(`Writing diff mask as image to ${diffFile}`)
  fs.writeFileSync(diffFile, PNG.sync.write(diff))
  core.info(`Uploading diff mask as image to latest release`)
  await uploadImageToRelease({
    octokit,
    release_id: latestReleaseId,
    name: diffFile,
    filepath: diffFile
  })
}

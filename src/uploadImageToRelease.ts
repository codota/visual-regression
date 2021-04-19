import * as core from '@actions/core'
import * as github from '@actions/github'
import {getType} from 'mime'
import fs from 'fs'
import {GitHub} from '@actions/github/lib/utils'

interface UploadImageProperties {
  release_id: number
  name: string
  filepath: string
  octokit: InstanceType<typeof GitHub>
}

export default async function uploadImageToRelease({
  octokit,
  release_id,
  name,
  filepath
}: UploadImageProperties): Promise<void> {
  const {owner, repo} = github.context.repo
  const fileMime = getType(filepath) || 'application/octet-stream'
  const charset: 'utf-8' | null = fileMime.includes('text') ? 'utf-8' : null

  const headers = {
    'content-type': fileMime,
    'content-length': fs.statSync(filepath).size
  }

  core.info(
    `Uploading file (${fileMime}) to ${owner}/${repo} release ${release_id} with name: ${name}`
  )
  await octokit.repos.uploadReleaseAsset({
    owner,
    repo,
    release_id,
    headers,
    name,
    data: (fs.readFileSync(filepath, charset) as unknown) as string
  })
  core.info(`Uploaded successfully.`)
}

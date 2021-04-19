import * as github from '@actions/github'

export default function imageUrl(version: string, filename: string): string {
  const {owner, repo} = github.context.repo

  return `https://github.com/${owner}/${repo}/releases/download/${version}/${filename}`
}

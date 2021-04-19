import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'

export interface FindLatestReleases {
  latestReleaseVersion: string
  previousReleaseVersion: string | undefined
  latestReleaseId: number
}

export default async function findLatestReleases(
  octokit: InstanceType<typeof GitHub>
): Promise<FindLatestReleases> {
  const {owner, repo} = github.context.repo
  const [latest, previous] = (
    await octokit.repos.listReleases({owner, repo})
  ).data.filter(({draft, prerelease}) => !draft && !prerelease)

  return {
    latestReleaseVersion: latest.tag_name,
    previousReleaseVersion: previous?.tag_name as string | undefined,
    latestReleaseId: latest.id
  }
}

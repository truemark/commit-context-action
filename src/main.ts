import {getInput, setFailed, setOutput} from '@actions/core'
import {context} from '@actions/github'
import {Octokit} from '@octokit/core'

const repo = context.payload.repository?.name ?? ''
const owner = context.payload.repository?.owner.login ?? ''
const baseUrl =
  getInput('org') !== 'false' ? `/orgs/${owner}` : repo.includes('/') ? `/repos/${repo}` : `/repos/${owner}/${repo}`
const url = `${baseUrl}/actions/variables`

const octokit = new Octokit({auth: getInput('token')})

async function run(): Promise<void> {
  const name = getInput('repository-variable')

  // get commit context map from repository variables
  console.log(`GET ${url}/${name}`)
  let variableExists = false
  let contextMap: Map<string, string> = new Map()
  try {
    const getResponse = await octokit.request(`GET ${url}/${name}`, {owner, repo, name})
    variableExists = getResponse.status === 200 && getResponse.data?.value
    contextMap = new Map(JSON.parse(getResponse.data.value))
  } catch {
    /* variable does not exist yet */
  }

  const value = getInput('value')
  if (!value) {
    // return commit context
    console.log('return commit context')
    const result = contextMap.has(context.sha) ? contextMap.get(context.sha) : ''
    setOutput('value', result)
    if (result) console.log(`Successfully retrieved commit context from variable ${name}`)
    else console.log(`Could not retrieve commit context from variable ${name}`)
    return
  }

  // set commit context
  contextMap.set(context.sha, value)

  // prune entries
  const contextArray = Array.from(contextMap)
  const maxEntries = parseInt(getInput('max-entries'), 10)
  while (contextArray.length > maxEntries) contextArray.shift()

  try {
    if (variableExists) {
      // update repository variable
      const patchResponse = await octokit.request(`PATCH ${url}/${name}`, {
        owner,
        repo,
        name,
        value: JSON.stringify(contextArray)
      })
      if (patchResponse.status !== 204)
        throw new Error(`Wrong status was returned while updating repository variable: ${patchResponse.status}`)
    } else {
      // create repository variable
      const postResponse = await octokit.request(`POST ${url}`, {
        owner,
        repo,
        name,
        value: JSON.stringify(contextArray)
      })
      if (postResponse.status !== 201)
        throw new Error(`Wrong status was returned while creating repository variable: ${postResponse.status}`)
    }

    // return commit context
    setOutput('value', value)
    console.log(`Successfully saved commit context to variable ${name}`)
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()

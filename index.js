// Octokit.js
// https://github.com/octokit/core.js#readme
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: ''
  })
  

async function asyncCall() {
  await octokit.request('POST /repos/{owner}/{repo}/dispatches', {
    owner: 'rrachitha',
    repo: 'send-approval-email',
    event_type: 'send_approval_email',
    client_payload: {
      unit: false,
      integration: true
    }
  })
}

console.log(octokit)
asyncCall()
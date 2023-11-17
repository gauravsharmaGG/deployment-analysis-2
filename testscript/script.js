const fs = require('fs')
const { request } = require('https')
const { execSync } = require('child_process')


function sendRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      const chunks = []

      res.on('data', (chunk) => chunks.push(chunk))
      res.on('error', reject)
      res.on('end', () => {
        const { statusCode, headers } = res
        const body = chunks.join('')
        resolve({ status: statusCode, headers, body })
      })
    })

    req.on('error', reject)
    req.write(data, 'binary')
    req.end()
  })
}

function getReleaseNotes() {
  return execSync('git log -n 1 --skip 1 --no-merges --oneline').toString()
}

function getPayload(/** @type {string} */ eventPath) {
  const releaseNotes = getReleaseNotes()
  return {
    release_notes: releaseNotes,
  }
}

;(async () => {
  const payload = getPayload()
  console.log('Sending payload:', payload)

  const response = await sendRequest(
    {
      hostname: "www.google.com",
      port: 443,
      path: '/nothing',
      method: 'POST',
    },
    JSON.stringify(payload)
  )

  console.log(response)

  if (!(response.status >= 200 && response.status <= 299)) {
    throw new Error(
      `Request was not successful (with status: ${response.status}): ${response.body}`
    )
  }

  console.log('Successfully sent deployment event to DataFridge')
})().catch((err) => {
  console.error(err)
  process.exit(1)
})

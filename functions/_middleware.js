import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";

const cookieName = "ab-test-cookie"
const newHomepagePathName = "?ver=newUrl"

const abTest = async ({ request, next, env }) => {
  const url = new URL(request.url)
  // if homepage
  if (url.pathname === "/") {
    // if cookie ab-test-cookie=new then change the request to go to /test
    // if no cookie set, pass x% of traffic and set a cookie value to "current" or "new"

    let cookie = request.headers.get("cookie")
    // is cookie set?
    if (cookie && cookie.includes(`${cookieName}=new`)) {
      // pass the request to /test
      url.pathname = newHomepagePathName
      return env.ASSETS.fetch(url)
    } else {
      const percentage = Math.floor(Math.random() * 100)
      let version = "current" // default version
      // change pathname and version name for 50% of traffic 
      if (percentage < 40) {
        url.pathname = newHomepagePathName
        version = "new"
      }
      // get the static file from ASSETS, and attach a cookie
      const asset = await env.ASSETS.fetch(url)
      let response = new Response(asset.body, asset)
      response.headers.append("Set-Cookie", `${cookieName}=${version}; path=/`)
      return response
    }
  }
  return next()
};


const anotherTest = async ({ request, next, env }) => {
  const url = new URL(request.url)
  // if homepage
  if (url.pathname === "/") {
    // if cookie ab-test-cookie=new then change the request to go to /test
    // if no cookie set, pass x% of traffic and set a cookie value to "current" or "new"

    return cloudflareAccessPlugin({
      domain: "https://deployment-analysis.cloudflareaccess.com",
      aud: "e2cbe1189ffa4f36d89c21386171b473193b836f8ead18620d062d7ff08399ed",
    })
  }
  return next()
};



export const onRequest = cloudflareAccessPlugin({
  domain: "https://deployment-analysis.cloudflareaccess.com",
  aud: "e2cbe1189ffa4f36d89c21386171b473193b836f8ead18620d062d7ff08399ed",
});

// [abTest, anotherTest];
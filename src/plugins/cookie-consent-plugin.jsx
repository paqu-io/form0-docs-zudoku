import React from "react"

export function createCookieConsentPlugin(options = {}) {
  const umami = options.umami || {}
  const websiteId = umami.websiteId
  const scriptSrc = umami.scriptSrc || "https://cloud.umami.is/script.js"
  const domains = umami.domains || "form0.dev,docs.form0.dev,localhost"

  return {
    getHead: () => {
      if (!websiteId) return undefined
      return (
        <script
          type="text/plain"
          data-category="analytics"
          data-service="Umami"
          data-src={scriptSrc}
          data-website-id={websiteId}
          data-domains={domains}
        />
      )
    },
  }
}

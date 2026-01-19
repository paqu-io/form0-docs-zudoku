import React from "react"

export function FooterBrandBlock() {
  const currentYear = new Date().getFullYear()
  return (
    <div className="w-full text-center">
      <p className="mt-4 text-xs text-muted-foreground/70">
        Copyright © {currentYear} - All rights reserved | Made by 🦙 from{" "}
        <a
          href="https://paqu.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          paqu.io
        </a>
      </p>
      <button
        type="button"
        data-cc="show-preferencesModal"
        className="mt-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        Manage cookies
      </button>
    </div>
  )
}

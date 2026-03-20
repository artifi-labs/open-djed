import type { SidebarsConfig } from "@docusaurus/plugin-content-docs"

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  docsSidebar: [
    {
      type: "category",
      label: "Getting Started",
      items: [
        "getting-started/open-djed",
        "getting-started/how-it-works",
        "getting-started/quickstart",
      ],
    },
    {
      type: "category",
      label: "Core Concepts",
      items: [
        "concepts/djed-overview",
        {
          type: "category",
          label: "Open DJED Reverse Engineering",
          items: [
            "concepts/reverse-engineering/datums",
            "concepts/reverse-engineering/transactions",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Application User Guide",
      items: ["user-guide/index"],
    },
    {
      type: "category",
      label: "Project Architecture",
      items: [
        "architecture/index",
        {
          type: "category",
          label: "Packages",
          items: [
            "architecture/math",
            "architecture/registry",
            "architecture/txs",
            "architecture/cli",
            "architecture/db",
            "architecture/app",
            "architecture/api",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Support and FAQ",
      items: ["support/index", "faq/index"],
    },
    "contributing/index",
    {
      type: "category",
      label: "Catalyst",
      items: [
        "catalyst/proposal",
        {
          type: "category",
          label: "Milestones",
          items: ["catalyst/milestones/milestone1"],
        },
      ],
    },
    {
      type: "link",
      label: "OpenAPI Specification",
      href: "https://djed.artifi.finance",
    },
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
}

export default sidebars

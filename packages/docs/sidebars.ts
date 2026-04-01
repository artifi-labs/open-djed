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
      link: {
        type: "doc",
        id: "getting-started/getting-started",
      },
      items: [
        "getting-started/getting-started",
        "getting-started/how-it-works",
        "getting-started/quickstart",
      ],
    },
    {
      type: "category",
      label: "Core Concepts",
      items: [
        "concepts/djed-overview",
        /*{
          type: "category",
          label: "Open DJED Reverse Engineering",
          items: [
            "concepts/reverse-engineering/datums",
            "concepts/reverse-engineering/transactions",
          ],
        },*/
      ],
    },
    {
      type: "category",
      label: "User Guide",
      items: [
        "user-guide/index",
        "user-guide/settings",
        "user-guide/connect-wallet",
        "user-guide/mint",
        "user-guide/burn",
        "user-guide/orders",
        "user-guide/analytics",
        "user-guide/simulator",
      ],
    },
    "architecture/index",

    {
      type: "category",
      label: "Catalyst",
      items: [
        "catalyst/proposal",
        {
          type: "category",
          label: "Milestones",
          items: [
            "catalyst/milestones/milestone1",
            "catalyst/milestones/milestone2",
            "catalyst/milestones/milestone3",
            "catalyst/milestones/milestone4",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Support & FAQ",
      items: ["support-faq/support", "support-faq/faq"],
    },
    "contributing/index",
    {
      type: "link",
      label: "OpenAPI Specification",
      href: "https://api.djed.artifi.finance/api/scalar",
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

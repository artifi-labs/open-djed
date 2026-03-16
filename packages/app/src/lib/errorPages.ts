export const ERROR_PAGES = {
  404: {
    pageTitleKey: "errors.404.pageTitle",
    titleKey: "errors.404.title",
    content: {
      content1Key: "errors.404.content.content1",
      content2Key: "errors.404.content.content2",
    },
    button: {
      textKey: "errors.404.button.text",
      href: "/",
    },
    illustration: {
      mobile: {
        src: "/backgrounds/not-found/illustration-mobile.svg",
      },
      desktop: {
        src: "/backgrounds/not-found/illustration-desktop.svg",
      },
    },
  },
} as const

export type ErrorCode = keyof typeof ERROR_PAGES

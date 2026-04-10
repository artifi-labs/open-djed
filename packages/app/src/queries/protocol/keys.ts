export const protocolKeys = {
  all: ["protocolData"] as const,

  protocolData: () =>
    [...protocolKeys.all, "get"] as const,
}

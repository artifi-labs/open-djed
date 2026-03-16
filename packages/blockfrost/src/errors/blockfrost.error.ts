export class BlockfrostError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    public readonly path: string,
  ) {
    super(`Blockfrost API error ${status} on ${path}: ${body}`)
    this.name = "BlockfrostError"
  }
}
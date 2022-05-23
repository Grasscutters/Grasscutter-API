/**
 * Base64 encodes an object.
 * @param data The object to encode.
 */
export function base64Encode(data: object): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Base64 decodes an object.
 * @param data The object to decode.
 */
export function base64Decode(data: string): object {
  return JSON.parse(Buffer.from(data, 'base64').toString());
}
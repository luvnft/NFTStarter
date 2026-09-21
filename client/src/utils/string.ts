import { BigNumberish, encode } from "starknet";

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// Only allows letters and numbers
const alphanumericRgex = /[^a-zA-Z0-9]/gi;
export function sanitizeString(str: string) {
  if (!str || typeof str !== 'string') return '';
  return str.replaceAll(alphanumericRgex, '').toLowerCase();
}

export function trimToLength(value: string, maxLength: number) {
  if (!value) return '';
  const trimmed = value.trim();
  return trimmed.length > maxLength
    ? trimmed.substring(0, maxLength) + '...'
    : trimmed;
}

interface Sliceable {
  length: number;
  slice: (i: number, j: number) => any;
}

export function chunk<T extends Sliceable>(str: T, size: number) {
  const R: Array<T> = [];
  for (let i = 0; i < str.length; i += size) {
    R.push(str.slice(i, i + size));
  }
  return R;
}

export function shortenAddress(address: string, capitalize?: boolean) {
  const shortened =
    address.substring(0, 5) + '...' + address.substring(address.length - 4);
  return shortened;
}

export function stringToBigNumberishArray(message: string): BigNumberish[] {
  // Step 1: Encode the string into bytes
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);

  // Step 2: Split the bytes into 31-byte chunks
  const chunkSize = 31; // Each felt252 can store 31 bytes
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(bytes.slice(i, i + chunkSize));
  }

  // Step 3: Convert each chunk to BigNumberish
  const bigNumberishArray: BigNumberish[] = chunks.map((chunk) => {
    // Convert the chunk to a hex string
    const hexString = encode.addHexPrefix(encode.buf2hex(chunk));
    // Convert the hex string to a BigNumberish value
    return BigInt(hexString);
  });

  return bigNumberishArray;
}

type LongObject = {
  low: number;
  high: number;
  unsigned: boolean;
};

export function generateRandomHex(length: number): string {
  const hexChars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += hexChars[Math.floor(Math.random() * hexChars.length)];
  }
  return result;
}

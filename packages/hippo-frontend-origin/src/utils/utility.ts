/** Convert string to hex-encoded utf-8 bytes. */
export const stringToHex = (text: string) => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  return Array.from(encoded, (i) => i.toString(16).padStart(2, '0')).join('');
};

export const walletAddressEllipsis = (address: string) => {
  if (!address) {
    return address;
  }
  return address.slice(0, 4) + '...' + address.slice(-6);
};

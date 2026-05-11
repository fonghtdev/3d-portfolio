async function generateAESKey(password: string): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);
  const hashedPassword = await crypto.subtle.digest("SHA-256", passwordBuffer);
  return crypto.subtle.importKey(
    "raw",
    hashedPassword.slice(0, 32),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

export const decryptFile = async (
  url: string,
  password: string,
  onProgress?: (percent: number) => void
): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  const contentLength = Number(response.headers.get("content-length"));
  let encryptedData: ArrayBuffer;

  if (response.body && contentLength > 0) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;
      onProgress?.(Math.min(Math.round((receivedLength / contentLength) * 45), 45));
    }

    const encryptedBytes = new Uint8Array(receivedLength);
    let position = 0;
    chunks.forEach((chunk) => {
      encryptedBytes.set(chunk, position);
      position += chunk.length;
    });
    encryptedData = encryptedBytes.buffer;
  } else {
    encryptedData = await response.arrayBuffer();
    onProgress?.(45);
  }

  onProgress?.(50);
  const iv = new Uint8Array(encryptedData.slice(0, 16));
  const data = encryptedData.slice(16);
  const key = await generateAESKey(password);
  const decryptedData = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, data);
  onProgress?.(65);

  return decryptedData;
};

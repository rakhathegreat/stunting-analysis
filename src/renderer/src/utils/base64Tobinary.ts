export function base64ToArrayBuffer(base64WithMeta: string): {
  buffer: ArrayBuffer;
  ext: 'jpg' | 'png';
} {
  // 1. pisahkan metadata
  const [meta, pure] = base64WithMeta.includes('base64,')
    ? base64WithMeta.split('base64,')
    : ['', base64WithMeta];

  // 2. tentukan ekstensi
  const ext = meta.includes('png') ? 'png' : 'jpg';

  // 3. decode base64 → binary
  const bin = atob(pure);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);

  return { buffer: buf, ext };
}
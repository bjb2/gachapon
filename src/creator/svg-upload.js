// Drag-drop / file-picker that turns a File into an art object.
// SVG files → { kind: 'svg', source: 'inline', value: <text> } so they're self-contained.
// Image files → stored as a blob in the `blobs` IDB store; art → { kind: 'image', source: 'blob', value: <key> }.
import { putBlob } from '../prizes/prize-store.js';

export function attachDropZone(el, onArt) {
  const pickOne = async (file) => {
    if (!file) return;
    if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
      const text = await file.text();
      onArt({ kind: 'svg', source: 'inline', value: text });
      return;
    }
    if (/^image\//.test(file.type)) {
      const key = `blob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await putBlob(key, file);
      onArt({ kind: 'image', source: 'blob', value: key });
      return;
    }
    // Unknown — still try as text (maybe raw SVG with wrong MIME).
    try {
      const text = await file.text();
      if (/<svg/i.test(text)) {
        onArt({ kind: 'svg', source: 'inline', value: text });
        return;
      }
    } catch (e) {}
    alert('Unsupported file type. Use .svg or an image.');
  };

  el.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg,image/svg+xml,image/png,image/jpeg,image/webp,image/gif';
    input.addEventListener('change', () => pickOne(input.files[0]));
    input.click();
  });

  el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag'); });
  el.addEventListener('dragleave', () => el.classList.remove('drag'));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drag');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) pickOne(f);
  });
}

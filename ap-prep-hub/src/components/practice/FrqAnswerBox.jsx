import React, { useRef, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { compressImage, MAX_PHOTOS } from '../../utils/answerImages';

/**
 * Written-response box: typed text and photos of handwritten work in one
 * bordered box, the way a student hands in an FRQ (write some, show the rest
 * on paper). Photos come from the camera/files button, paste, or drag-and-drop.
 */
export default function FrqAnswerBox({ value, onChange, images = [], onImagesChange, ariaLabel }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [enlarged, setEnlarged] = useState(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = async (files) => {
    const list = Array.from(files || []).filter((f) => /^image\//.test(f.type));
    if (!list.length) return;
    const room = MAX_PHOTOS - images.length;
    if (room <= 0) { setError(`Up to ${MAX_PHOTOS} photos per question.`); return; }
    setBusy(true);
    setError(list.length > room ? `Only the first ${room} added: up to ${MAX_PHOTOS} photos per question.` : '');
    const added = [];
    for (const f of list.slice(0, room)) {
      try { added.push(await compressImage(f)); } catch (e) { setError(e.message); }
    }
    setBusy(false);
    if (added.length) onImagesChange([...images, ...added]);
  };

  const remove = (id) => {
    onImagesChange(images.filter((img) => img.id !== id));
    if (enlarged === id) setEnlarged(null);
    setError('');
  };

  const words = String(value || '').trim().split(/\s+/).filter(Boolean).length;
  const big = images.find((img) => img.id === enlarged);

  return (
    <div>
      <div
        className={`rounded-md border bg-white focus-within:ring-2 focus-within:ring-[var(--bb-blue)] ${dragging ? 'border-[var(--bb-blue)] border-dashed' : 'border-[var(--bb-ink)]'}`}
        onDragOver={(e) => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); setDragging(true); } }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); } }}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => {
            const files = [...(e.clipboardData?.files || [])].filter((f) => /^image\//.test(f.type));
            if (files.length) { e.preventDefault(); addFiles(files); }
          }}
          aria-label={ariaLabel}
          placeholder={images.length ? 'Add any typed work or notes here (optional).' : 'Type your response here, or add photos of your handwritten work.'}
          className="bb-serif block w-full min-h-[14rem] p-4 rounded-t-md bg-transparent text-[16px] leading-relaxed text-[var(--bb-ink)] placeholder:text-[#777] focus:outline-none resize-y"
        />

        {images.length > 0 && (
          <div className="px-3 pt-2">
            {big && (
              <figure className="mb-2">
                <img src={big.dataUrl} alt={`Your work, page ${images.indexOf(big) + 1} (enlarged)`} className="w-full max-h-[70vh] object-contain rounded border border-[#ccc] bg-[#f6f6f6]" />
              </figure>
            )}
            <ul className="flex flex-wrap gap-2" aria-label="Photos of your work">
              {images.map((img, i) => (
                <li key={img.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setEnlarged(enlarged === img.id ? null : img.id)}
                    aria-pressed={enlarged === img.id}
                    aria-label={`Photo ${i + 1}: ${enlarged === img.id ? 'shrink' : 'enlarge'}`}
                    className={`block w-20 h-20 sm:w-24 sm:h-24 rounded border-2 overflow-hidden bg-[#f6f6f6] ${enlarged === img.id ? 'border-[var(--bb-blue)]' : 'border-[#ccc]'}`}
                  >
                    <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[var(--bb-ink)] text-white flex items-center justify-center shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy || images.length >= MAX_PHOTOS}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-[var(--bb-ink)] font-semibold text-[var(--bb-ink)] hover:bg-[#f0f0f0] disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {busy ? 'Adding…' : 'Add photo of work'}
          </button>
          <span className="text-xs text-[#555]">
            {images.length ? `${images.length} of ${MAX_PHOTOS} photos` : 'or paste / drop an image'} · graded with your text
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          />
        </div>
      </div>
      <div className="flex justify-between gap-3 text-xs text-[#555] mt-1">
        <span role="status" className={error ? 'text-[#b00020]' : ''}>{error}</span>
        <span>{words} words</span>
      </div>
    </div>
  );
}

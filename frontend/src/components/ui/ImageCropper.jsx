import { useState, useRef, useCallback } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

// Compress canvas to under 1MB JPEG
const compressCanvas = (canvas, maxKB = 900) => {
  return new Promise((resolve) => {
    let quality = 0.9;
    const tryCompress = () => {
      canvas.toBlob((blob) => {
        if (blob.size / 1024 <= maxKB || quality <= 0.1) {
          resolve(blob);
        } else {
          quality -= 0.1;
          tryCompress();
        }
      }, 'image/jpeg', quality);
    };
    tryCompress();
  });
};

export default function ImageCropper({ file, onDone, onCancel, aspectRatio = 4/3 }) {
  const canvasRef  = useRef();
  const imageRef   = useRef();
  const containerRef = useRef();

  const [zoom, setZoom]       = useState(1);
  const [rotate, setRotate]   = useState(0);
  const [offset, setOffset]   = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const imgSrc = file ? URL.createObjectURL(file) : null;

  const CROP_W = 320;
  const CROP_H = CROP_W / aspectRatio;

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const handleTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleCrop = async () => {
    setProcessing(true);
    const img    = imageRef.current;
    const canvas = document.createElement('canvas');
    const OUTPUT = 800;
    canvas.width  = OUTPUT;
    canvas.height = OUTPUT / aspectRatio;
    const ctx = canvas.getContext('2d');

    const scaleX = img.naturalWidth  / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Center of crop box in image coords
    const cx = (CROP_W / 2 - offset.x) * scaleX / zoom;
    const cy = (CROP_H / 2 - offset.y) * scaleY / zoom;
    const cropW = (CROP_W * scaleX) / zoom;
    const cropH = (CROP_H * scaleY) / zoom;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(img, cx - cropW/2, cy - cropH/2, cropW, cropH, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const blob = await compressCanvas(canvas, 900);
    const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    setProcessing(false);
    onDone(croppedFile);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="font-semibold text-[#1a3a5c] text-sm">Crop & Compress Image</p>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {/* Crop area */}
        <div
          ref={containerRef}
          className="relative overflow-hidden bg-gray-900 select-none"
          style={{ width: CROP_W, height: CROP_H, margin: '0 auto', cursor: dragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {imgSrc && (
            <img
              ref={imageRef}
              src={imgSrc}
              alt="crop"
              onLoad={() => setImgLoaded(true)}
              style={{
                position: 'absolute',
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotate}deg)`,
                transformOrigin: 'center',
                userSelect: 'none',
                maxWidth: 'none',
                width: CROP_W,
              }}
              draggable={false}
            />
          )}
          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: `${CROP_W/3}px ${CROP_H/3}px`,
            border: '2px solid rgba(255,255,255,0.8)',
          }} />
        </div>

        {/* Controls */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <ZoomOut size={14} className="text-gray-400 flex-shrink-0" />
            <input type="range" min="0.5" max="3" step="0.05" value={zoom}
              onChange={e => setZoom(Number(e.target.value))} className="flex-1 accent-[#1a3a5c]" />
            <ZoomIn size={14} className="text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRotate(r => r - 90)} className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1 flex-1 justify-center">
              <RotateCw size={13} className="scale-x-[-1]" /> Rotate Left
            </button>
            <button onClick={() => setRotate(r => r + 90)} className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1 flex-1 justify-center">
              <RotateCw size={13} /> Rotate Right
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center">Drag to reposition · Will be compressed to under 1MB</p>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleCrop} disabled={processing || !imgLoaded} className="btn-primary flex-1 justify-center">
            <Check size={14} /> {processing ? 'Processing...' : 'Use This Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}

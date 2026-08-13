import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  /** Called with a PNG File when the user confirms their drawn signature. */
  onCapture: (file: File) => void;
  width?: number;
  height?: number;
  penColor?: string;
}

/**
 * A device-agnostic signature pad. Uses Pointer Events so it works with a mouse
 * (laptop/desktop), touch (phone/tablet), and pen/stylus. The drawn signature is
 * exported as a PNG File so it flows through the same upload path as an attached
 * signature image.
 */
export const SignaturePad: React.FC<SignaturePadProps> = ({
  onCapture,
  width = 600,
  height = 220,
  penColor = '#0f172a',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const primeContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    return ctx;
  }, [penColor]);

  const fillWhite = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    fillWhite();
    primeContext();
  }, [fillWhite, primeContext]);

  const posFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    // Map the CSS-pixel pointer position to the canvas' internal pixel grid.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = primeContext();
    if (!ctx) return;
    const { x, y } = posFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
    try { canvasRef.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = posFromEvent(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasInk) setHasInk(true);
  };

  const handleUp = () => {
    drawing.current = false;
  };

  const clear = () => {
    fillWhite();
    primeContext();
    setHasInk(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });
      onCapture(file);
    }, 'image/png');
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border-2 border-dashed border-purple-300 bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block w-full cursor-crosshair"
          style={{ touchAction: 'none', height: 'auto' }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
          onPointerCancel={handleUp}
        />
      </div>
      <p className="text-center text-xs text-slate-400">
        Sign above using your mouse, finger, or stylus.
      </p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Eraser className="h-4 w-4" /> Clear
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!hasInk}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Check className="h-4 w-4" /> Use this signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;

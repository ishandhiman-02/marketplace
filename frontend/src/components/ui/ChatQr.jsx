import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/**
 * A QR code for the ig.me chat link.
 *
 * This exists because Instagram Web has no address for "message this username".
 * Every candidate has been tried on a signed-in desktop browser and each one
 * fails — ig.me answers HTTP 400, /m/<handle> shows "this page isn't available",
 * and /direct/new/?username= silently opens the visitor's own inbox. The first
 * message simply cannot be deep-linked on a computer.
 *
 * A phone can do it, so the desktop path hands over to one: scan, and the app
 * opens the chat with us directly. It routes around the platform limit instead
 * of pretending it is not there.
 *
 * Rendered as inline SVG — no canvas, no network request, and it stays sharp at
 * any size.
 */
export function ChatQr({ url, size = 168 }) {
  const path = useMemo(() => {
    // Type 0 = pick the smallest version that fits. 'M' tolerates ~15% damage,
    // which matters for a code someone photographs off a screen at an angle.
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();

    const count = qr.getModuleCount();
    let d = '';
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`;
      }
    }
    return { d, count };
  }, [url]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-1 -1 ${path.count + 2} ${path.count + 2}`}
      role="img"
      aria-label="QR code to open the chat on your phone"
      style={{ background: '#ffffff', borderRadius: 12, display: 'block' }}
      shapeRendering="crispEdges"
    >
      <path d={path.d} fill="#0f172a" />
    </svg>
  );
}

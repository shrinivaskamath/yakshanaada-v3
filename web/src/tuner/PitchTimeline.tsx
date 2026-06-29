import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { TOTAL_HEIGHT, KEY_SLOT, OCTAVES, noteToY } from './pitch-layout';
import type { DetectedNote } from './WebTuner';

const STEP = 4; // px the trace advances per tick (horizontal time axis)
const TICK_MS = 60; // sampling interval
const SILENCE_MS = 220; // no detection for this long => break the line (gap)

interface Props {
  note: DetectedNote;
  lastDetected: number;
}

// Continuously scrolling pitch trace. New samples enter from the right edge
// (next to the keyboard) and scroll left. Ported from pitch-timeline.js.
export default function PitchTimeline({ note, lastDetected }: Props) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [samples, setSamples] = useState<(number | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const liveRef = useRef({ note, lastDetected });
  liveRef.current = { note, lastDetected };

  const maxSamples = Math.max(8, Math.ceil(width / STEP) + 2);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (width <= 0) return;
    const id = setInterval(() => {
      const { note: n, lastDetected: ld } = liveRef.current;
      const fresh =
        !!n && !!ld && n.frequency > 0 && Date.now() - ld < SILENCE_MS;
      const y = fresh ? noteToY(n.name, n.octave, n.cents) : null;
      setSamples((prev) => {
        const next = prev.concat(y);
        if (next.length > maxSamples) {
          next.splice(0, next.length - maxSamples);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [width, maxSamples]);

  const segments: string[][] = [];
  let segment: string[] = [];
  const len = samples.length;
  samples.forEach((s, i) => {
    if (s == null) {
      if (segment.length) {
        segments.push(segment);
        segment = [];
      }
      return;
    }
    const x = width - (len - 1 - i) * STEP;
    segment.push(`${x.toFixed(1)},${s.toFixed(1)}`);
  });
  if (segment.length) segments.push(segment);

  const lastSample = samples[len - 1];

  return (
    <div
      ref={containerRef}
      className="tuner-timeline"
      style={{ backgroundColor: colors.timelineBackground, height: TOTAL_HEIGHT }}
    >
      {width > 0 && (
        <svg width={width} height={TOTAL_HEIGHT}>
          {OCTAVES.map((oct, i) => {
            const y = i * 12 * KEY_SLOT;
            return (
              <line
                key={`oct-${oct}`}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke={colors.timelineGuide}
                strokeWidth={1}
              />
            );
          })}
          {segments.map((pts, idx) => (
            <polyline
              key={`seg-${idx}`}
              points={pts.join(' ')}
              fill="none"
              stroke="#c62828"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {lastSample != null && (
            <circle cx={width} cy={lastSample} r={4} fill="#c62828" />
          )}
        </svg>
      )}
    </div>
  );
}

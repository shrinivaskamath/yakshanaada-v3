import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Polyline, Circle, Line} from 'react-native-svg';
import {
  TOTAL_HEIGHT,
  KEY_SLOT,
  OCTAVES,
  noteToY,
} from './pitch-layout';
import {useTheme} from '../theme';

const STEP = 4; // px the trace advances per tick (horizontal time axis)
const TICK_MS = 60; // sampling interval
const SILENCE_MS = 220; // no detection for this long => break the line (gap)

// Continuously scrolling pitch trace, styled after singingcarrots.com/pitch-monitor.
// New samples enter from the right edge (next to the keyboard) and scroll left.
// Vertical position is shared with the harmonium keyboard via noteToY().
export default function PitchTimeline({note, lastDetected}) {
  const {colors} = useTheme();
  const [width, setWidth] = useState(0);
  const [samples, setSamples] = useState([]); // array of {y} | null

  const liveRef = useRef({note, lastDetected});
  liveRef.current = {note, lastDetected};

  const maxSamples = Math.max(8, Math.ceil(width / STEP) + 2);

  useEffect(() => {
    if (width <= 0) return undefined;
    const id = setInterval(() => {
      const {note: n, lastDetected: ld} = liveRef.current;
      const fresh =
        !!n && !!ld && n.frequency > 0 && Date.now() - ld < SILENCE_MS;
      const y = fresh ? noteToY(n.name, n.octave, n.cents) : null;
      setSamples(prev => {
        const next = prev.concat(y);
        if (next.length > maxSamples) {
          next.splice(0, next.length - maxSamples);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [width, maxSamples]);

  // Split the buffer into contiguous (non-silent) segments for the polyline.
  const segments = [];
  let current = [];
  const len = samples.length;
  samples.forEach((s, i) => {
    if (s == null) {
      if (current.length) {
        segments.push(current);
        current = [];
      }
      return;
    }
    const x = width - (len - 1 - i) * STEP;
    current.push(`${x.toFixed(1)},${s.toFixed(1)}`);
  });
  if (current.length) segments.push(current);

  // Position of the most recent live sample (the "now" marker).
  const lastSample = samples[len - 1];

  // Faint horizontal guide line at the start (C) of each octave.
  const octaveLines = OCTAVES.map((oct, i) => {
    const y = i * 12 * KEY_SLOT;
    return (
      <Line
        key={`oct-${oct}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={colors.timelineGuide}
        strokeWidth={1}
      />
    );
  });

  return (
    <View
      style={[styles.container, {backgroundColor: colors.timelineBackground}]}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={TOTAL_HEIGHT}>
          {octaveLines}
          {segments.map((pts, idx) => (
            <Polyline
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
            <Circle cx={width} cy={lastSample} r={4} fill="#c62828" />
          )}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: TOTAL_HEIGHT,
    overflow: 'hidden',
  },
});

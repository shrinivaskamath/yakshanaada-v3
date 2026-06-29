import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const TOTAL_SEGMENTS = 36;

// Green gradient: light green (octave 2) → medium green (octave 3) → dark green (octave 4)
const getGreenColor = index => {
  const octave = Math.floor(index / 12); // 0 (octave 2), 1 (octave 3), 2 (octave 4)
  const colors = [
    '#A5D6A7', // Light green
    '#66BB6A', // Medium green
    '#2E7D32', // Dark green
  ];
  return colors[Math.min(octave, 2)];
};

export default function RadialGauge({name, octave, frequency}) {
  const rotationValue = useSharedValue(0);

  // Calculate active index (0-35)
  const noteToIndex = {
    C: 0,
    'C#': 1,
    'C♯': 1,
    D: 2,
    'D#': 3,
    'D♯': 3,
    E: 4,
    F: 5,
    'F#': 6,
    'F♯': 6,
    G: 7,
    'G#': 8,
    'G♯': 8,
    A: 9,
    'A#': 10,
    'A♯': 10,
    B: 11,
  };

  const normalized = String(name).toUpperCase();
  const noteIdx = noteToIndex[normalized] || 0;
  const octaveOffset = (octave - 2) * 12;
  const activeIndex = octaveOffset + noteIdx;

  useEffect(() => {
    rotationValue.value = withTiming(activeIndex, {duration: 400});
  }, [activeIndex, rotationValue]);

  // Animated needle rotation
  const needleAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      rotationValue.value,
      [0, TOTAL_SEGMENTS - 1],
      [-90, 90],
      Extrapolate.CLAMP,
    );
    return {
      transform: [{rotate: `${rotation}deg`}],
    };
  });

  const GAUGE_SIZE = 280;
  const CENTER = GAUGE_SIZE / 2;
  const SEGMENT_ANGLE = 180 / TOTAL_SEGMENTS;

  // Render all gauge segments (36 colored arcs)
  const renderSegments = () => {
    const segments = [];
    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
      const angle = i * SEGMENT_ANGLE - 90;
      const isActive = i === activeIndex;

      segments.push(
        <Animated.View
          key={`segment-${i}`}
          style={[
            styles.segment,
            {
              backgroundColor: getGreenColor(i),
              opacity: isActive ? 1 : 0.7,
              transform: [
                {rotate: `${angle}deg`},
                {translateY: isActive ? -95 : -100},
              ],
            },
          ]}
        />,
      );
    }
    return segments;
  };

  // Render labels for all 36 notes
  const renderLabels = () => {
    const labels = [];
    const labelRadius = 125;

    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
      const angle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180);
      const x = CENTER + labelRadius * Math.cos(angle);
      const y = CENTER + labelRadius * Math.sin(angle);

      const noteChar = NOTES[i % 12];
      const octaveNum = Math.floor(i / 12) + 2;
      const isActive = i === activeIndex;

      labels.push(
        <View
          key={`label-${i}`}
          style={[
            styles.noteLabel,
            {
              left: x - 16,
              top: y - 12,
            },
          ]}>
          <Text
            style={[
              styles.labelNote,
              {
                color: isActive ? '#1B5E20' : '#388E3C',
                fontSize: isActive ? 11 : 9,
                fontWeight: isActive ? '700' : '600',
              },
            ]}>
            {noteChar}
          </Text>
          <Text
            style={[
              styles.labelOctave,
              {
                color: isActive ? '#1B5E20' : '#999',
              },
            ]}>
            {octaveNum}
          </Text>
        </View>,
      );
    }
    return labels;
  };

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        {/* Background circle */}
        <View style={styles.gaugeBg} />

        {/* Gauge segments container */}
        <View
          style={[
            styles.segmentsContainer,
            {width: GAUGE_SIZE, height: GAUGE_SIZE},
          ]}>
          {renderSegments()}
        </View>

        {/* Labels overlay */}
        <View
          style={[
            styles.labelsContainer,
            {width: GAUGE_SIZE, height: GAUGE_SIZE},
          ]}>
          {renderLabels()}
        </View>

        {/* Animated needle */}
        <Animated.View
          style={[
            styles.needleContainer,
            {width: GAUGE_SIZE, height: GAUGE_SIZE},
            needleAnimatedStyle,
          ]}>
          <View style={styles.needle} />
        </Animated.View>

        {/* Center pivot point */}
        <View style={styles.pivot} />
      </View>

      {/* Info panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.noteName}>{name}</Text>
        <Text style={styles.octaveText}>Octave {octave}</Text>
        <Text style={styles.freqText}>{frequency.toFixed(1)} Hz</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  gaugeContainer: {
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeBg: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#F0F4F0',
    borderWidth: 2,
    borderColor: '#B0BFB0',
  },
  segmentsContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segment: {
    position: 'absolute',
    width: 12,
    height: 25,
    borderRadius: 6,
    top: 0,
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  labelsContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteLabel: {
    position: 'absolute',
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelNote: {
    fontWeight: '600',
    lineHeight: 10,
  },
  labelOctave: {
    fontSize: 6,
    lineHeight: 5,
  },
  needleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  needle: {
    position: 'absolute',
    width: 4,
    height: 85,
    backgroundColor: '#1B5E20',
    borderRadius: 2,
    top: 14,
  },
  pivot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1B5E20',
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 10,
  },
  infoPanel: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  noteName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
  },
  octaveText: {
    fontSize: 12,
    color: '#388E3C',
    marginTop: 4,
  },
  freqText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 4,
  },
});

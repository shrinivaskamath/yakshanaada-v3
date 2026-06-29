import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {
  Circle,
  Path,
  Text as SvgText,
  Line,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const TOTAL_SEGMENTS = 36;
const GAUGE_SIZE = 300;
const CENTER_X = GAUGE_SIZE / 2;
const CENTER_Y = GAUGE_SIZE;
const RADIUS = 100;
const INNER_RADIUS = 70;
const SEGMENT_ANGLE = 180 / TOTAL_SEGMENTS;

const getSegmentColor = index => {
  const octave = Math.floor(index / 12);
  const colors = [
    '#81C784', // Light green
    '#4CAF50', // Medium green
    '#2E7D32', // Dark green
  ];
  return colors[Math.min(octave, 2)];
};

export default function RadialGaugeSvg({name, octave, frequency}) {
  const [rotation, setRotation] = useState(0);

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
  // Tuner returns octave value that is 1 less than standard (e.g., E3 comes as octave 2)
  // Add 1 to align with standard musical notation (2, 3, 4)
  const adjustedOctave = octave + 1;
  const octaveOffset = (adjustedOctave - 2) * 12;
  const activeIndex = octaveOffset + noteIdx;

  useEffect(() => {
    const targetRotation = 180 - activeIndex * SEGMENT_ANGLE;
    setRotation(targetRotation);
  }, [activeIndex]);

  const renderGaugeSegments = () => {
    const segments = [];

    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
      const startAngle = (180 + i * SEGMENT_ANGLE) * (Math.PI / 180);
      const endAngle = (180 + (i + 1) * SEGMENT_ANGLE) * (Math.PI / 180);

      const x1 = CENTER_X + RADIUS * Math.cos(startAngle);
      const y1 = CENTER_Y + RADIUS * Math.sin(startAngle);
      const x2 = CENTER_X + RADIUS * Math.cos(endAngle);
      const y2 = CENTER_Y + RADIUS * Math.sin(endAngle);

      const innerX1 = CENTER_X + INNER_RADIUS * Math.cos(startAngle);
      const innerY1 = CENTER_Y + INNER_RADIUS * Math.sin(startAngle);
      const innerX2 = CENTER_X + INNER_RADIUS * Math.cos(endAngle);
      const innerY2 = CENTER_Y + INNER_RADIUS * Math.sin(endAngle);

      const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;

      const pathData = `
        M ${x1} ${y1}
        A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${x2} ${y2}
        L ${innerX2} ${innerY2}
        A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 1 ${innerX1} ${innerY1}
        Z
      `;

      const isActive = i === activeIndex;
      const color = getSegmentColor(i);

      segments.push(
        <Path
          key={`segment-${i}`}
          d={pathData}
          fill={color}
          opacity={isActive ? 1 : 0.6}
          strokeWidth={0.5}
          stroke={isActive ? '#1B5E20' : 'rgba(0,0,0,0.1)'}
        />,
      );
    }

    return segments;
  };

  const renderNoteLabels = () => {
    const labels = [];
    const labelRadius = 130;

    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
      const angle = (180 + i * SEGMENT_ANGLE) * (Math.PI / 180);
      const x = CENTER_X + labelRadius * Math.cos(angle);
      const y = CENTER_Y + labelRadius * Math.sin(angle);

      const noteChar = NOTES[i % 12];
      const octaveNum = Math.floor(i / 12) + 2;
      const isActive = i === activeIndex;

      labels.push(
        <G key={`label-${i}`}>
          <SvgText
            x={x}
            y={y}
            textAnchor="middle"
            fontSize={isActive ? 12 : 10}
            fontWeight={isActive ? '700' : '600'}
            fill={isActive ? '#1B5E20' : '#2E7D32'}>
            {noteChar}
          </SvgText>
          <SvgText
            x={x}
            y={y + 10}
            textAnchor="middle"
            fontSize="7"
            fill={isActive ? '#1B5E20' : '#999'}>
            {octaveNum}
          </SvgText>
        </G>,
      );
    }

    return labels;
  };

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
          <Defs>
            <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#F5F9F5" stopOpacity="1" />
              <Stop offset="100%" stopColor="#E8F5E9" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Background */}
          <Circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={RADIUS + 15}
            fill="url(#bgGradient)"
            stroke="#B0BFB0"
            strokeWidth="2"
          />

          {/* Gauge segments */}
          {renderGaugeSegments()}

          {/* Inner circle background */}
          <Circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={INNER_RADIUS - 5}
            fill="#FFFFFF"
            stroke="#E0E0E0"
            strokeWidth="1"
          />

          {/* Note labels */}
          {renderNoteLabels()}

          {/* Needle */}
          <G
            origin={`${CENTER_X},${CENTER_Y}`}
            transform={`rotate(${rotation} ${CENTER_X} ${CENTER_Y})`}>
            <Line
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={CENTER_X}
              y2={CENTER_Y + 85}
              stroke="#D32F2F"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </G>

          {/* Center pivot */}
          <Circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="8"
            fill="#1B5E20"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </Svg>
      </View>

      {/* Info panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.noteName}>{name}</Text>
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
  svgContainer: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoPanel: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  noteName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
  },
});

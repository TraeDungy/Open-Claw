#!/bin/bash
# ── TSG Frequency Tone Generator ──
# Generates pure tone with harmonic overtones for The Frequency Room series
# Usage: ./generate-frequency-tone.sh <freq_hz> <duration_sec> <output_path>
#
# Examples:
#   ./generate-frequency-tone.sh 432 3600 audio/tones/432hz-1h.wav
#   ./generate-frequency-tone.sh 7.83 3600 audio/tones/schumann-1h.wav

set -e

FREQ=${1:?Usage: $0 <freq_hz> <duration_sec> <output_path>}
DURATION=${2:?Missing duration}
OUTPUT=${3:?Missing output path}

# For sub-audible frequencies (<20Hz), use binaural method instead
IS_SUB=$(echo "$FREQ < 20" | bc -l)

echo "── TSG Frequency Tone Generator ──"
echo "  Frequency: ${FREQ} Hz"
echo "  Duration:  ${DURATION}s"

mkdir -p "$(dirname "$OUTPUT")"

if [ "$IS_SUB" -eq 1 ]; then
  echo "  Mode:      Binaural (sub-audible frequency)"
  # Use 200Hz carrier with binaural offset
  RIGHT=$(echo "200 + $FREQ" | bc -l)
  ffmpeg -y \
    -f lavfi -i "sine=frequency=200:duration=${DURATION}:sample_rate=48000" \
    -f lavfi -i "sine=frequency=${RIGHT}:duration=${DURATION}:sample_rate=48000" \
    -filter_complex "[0][1]amerge=inputs=2,loudnorm=I=-20:TP=-1[out]" \
    -map "[out]" -ac 2 -ar 48000 "$OUTPUT"
else
  echo "  Mode:      Pure tone + harmonics (2x, 3x, 5x)"
  H2=$(echo "$FREQ * 2" | bc -l)
  H3=$(echo "$FREQ * 3" | bc -l)
  H5=$(echo "$FREQ * 5" | bc -l)
  ffmpeg -y \
    -f lavfi -i "sine=frequency=${FREQ}:duration=${DURATION}:sample_rate=48000" \
    -f lavfi -i "sine=frequency=${H2}:duration=${DURATION}:sample_rate=48000" \
    -f lavfi -i "sine=frequency=${H3}:duration=${DURATION}:sample_rate=48000" \
    -f lavfi -i "sine=frequency=${H5}:duration=${DURATION}:sample_rate=48000" \
    -filter_complex \
    "[0]volume=-12dB[f1]; [1]volume=-24dB[f2]; [2]volume=-28dB[f3]; [3]volume=-32dB[f4]; \
     [f1][f2][f3][f4]amix=inputs=4:duration=longest,loudnorm=I=-20:TP=-1[out]" \
    -map "[out]" -ac 2 -ar 48000 "$OUTPUT"
fi

echo "  ✓ Generated: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"

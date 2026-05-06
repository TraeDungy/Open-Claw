#!/bin/bash
# ── TSG Binaural Beat Generator ──
# Generates stereo WAV with binaural beat (left/right frequency offset)
# Usage: ./generate-binaural.sh <carrier_hz> <beat_hz> <duration_sec> <output_path> [pink_noise_db]
#
# Examples:
#   ./generate-binaural.sh 200 6 10800 audio/binaural/theta-6hz-3h.wav
#   ./generate-binaural.sh 200 2 14400 audio/binaural/delta-2hz-4h.wav -40
#   ./generate-binaural.sh 200 7.83 3600 audio/binaural/schumann-1h.wav

set -e

CARRIER=${1:?Usage: $0 <carrier_hz> <beat_hz> <duration_sec> <output_path> [pink_noise_db]}
BEAT=${2:?Missing beat frequency}
DURATION=${3:?Missing duration in seconds}
OUTPUT=${4:?Missing output path}
PINK_DB=${5:--42}  # Pink noise level, default -42dB

# Calculate right channel frequency
RIGHT_FREQ=$(echo "$CARRIER + $BEAT" | bc -l)

echo "── TSG Binaural Generator ──"
echo "  Carrier:  ${CARRIER} Hz (left)"
echo "  Right:    ${RIGHT_FREQ} Hz"
echo "  Beat:     ${BEAT} Hz"
echo "  Duration: ${DURATION}s ($(echo "$DURATION / 3600" | bc -l | xargs printf '%.1f')h)"
echo "  Pink:     ${PINK_DB} dB"
echo "  Output:   ${OUTPUT}"
echo ""

mkdir -p "$(dirname "$OUTPUT")"

ffmpeg -y \
  -f lavfi -i "sine=frequency=${CARRIER}:duration=${DURATION}:sample_rate=48000" \
  -f lavfi -i "sine=frequency=${RIGHT_FREQ}:duration=${DURATION}:sample_rate=48000" \
  -f lavfi -i "anoisesrc=color=pink:duration=${DURATION}:sample_rate=48000" \
  -filter_complex \
  "[0]volume=-14dB[left]; \
   [1]volume=-14dB[right]; \
   [left][right]amerge=inputs=2[binaural]; \
   [2]volume=${PINK_DB}dB[pink]; \
   [binaural][pink]amix=inputs=2:duration=shortest,loudnorm=I=-23:TP=-1:LRA=11[out]" \
  -map "[out]" -ac 2 -ar 48000 \
  "$OUTPUT"

echo ""
echo "  ✓ Generated: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"

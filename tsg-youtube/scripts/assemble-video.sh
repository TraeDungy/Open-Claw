#!/bin/bash
# ── TSG Video Assembler ──
# Combines visual (image or video) + audio into final YouTube-ready MP4
# Usage: ./assemble-video.sh <series> <visual_path> <audio_path> <output_path> [overlay_image] [overlay_start_sec] [overlay_dur_sec]
#
# Series modes:
#   sleep-aide      — Still image + audio, 4K, long-form
#   frequency-room  — Still image + audio, 4K
#   black-room      — Black + optional symbol overlay at timed position
#   tk-mantra       — Still/animated + audio, 1080p
#   control-tapes   — Still image + audio, 1080p, film grain
#
# Examples:
#   ./assemble-video.sh sleep-aide poster.png audio.wav output.mp4
#   ./assemble-video.sh black-room black.png audio.wav output.mp4 circle.png 1380 11
#   ./assemble-video.sh control-tapes tape.png audio.wav output.mp4

set -e

SERIES=${1:?Usage: $0 <series> <visual> <audio> <output> [overlay] [overlay_start] [overlay_dur]}
VISUAL=${2:?Missing visual path}
AUDIO=${3:?Missing audio path}
OUTPUT=${4:?Missing output path}
OVERLAY=${5:-}
OVL_START=${6:-0}
OVL_DUR=${7:-11}

mkdir -p "$(dirname "$OUTPUT")"

echo "── TSG Video Assembler ──"
echo "  Series:  ${SERIES}"
echo "  Visual:  ${VISUAL}"
echo "  Audio:   ${AUDIO}"
echo "  Output:  ${OUTPUT}"

case "$SERIES" in
  sleep-aide|frequency-room)
    # 4K still image + audio
    ffmpeg -y -loop 1 -i "$VISUAL" -i "$AUDIO" \
      -c:v libx264 -tune stillimage -crf 23 -preset slow \
      -vf "scale=3840:2160:force_original_aspect_ratio=decrease,pad=3840:2160:(ow-iw)/2:(oh-ih)/2:color=0x050505,fps=30" \
      -c:a aac -b:a 256k -ar 48000 \
      -shortest -pix_fmt yuv420p -movflags +faststart \
      "$OUTPUT"
    ;;

  black-room)
    if [ -n "$OVERLAY" ] && [ -f "$OVERLAY" ]; then
      # Black video + timed symbol overlay
      AUDIO_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO" | cut -d. -f1)
      echo "  Overlay:  ${OVERLAY} at ${OVL_START}s for ${OVL_DUR}s"
      ffmpeg -y \
        -f lavfi -i "color=c=black:s=1920x1080:d=${AUDIO_DUR}:r=30" \
        -i "$OVERLAY" \
        -i "$AUDIO" \
        -filter_complex \
        "[1]format=rgba,fade=in:st=0:d=3:alpha=1,fade=out:st=$((OVL_DUR - 3)):d=3:alpha=1[sym]; \
         [0][sym]overlay=x=(W-w)/2:y=(H-h)/2:enable='between(t,${OVL_START},$((OVL_START + OVL_DUR)))'[v]" \
        -map "[v]" -map 2:a \
        -c:v libx264 -crf 18 -preset slow \
        -c:a aac -b:a 192k -ar 48000 \
        -pix_fmt yuv420p -movflags +faststart \
        "$OUTPUT"
    else
      # Pure black + audio
      AUDIO_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO" | cut -d. -f1)
      ffmpeg -y \
        -f lavfi -i "color=c=black:s=1920x1080:d=${AUDIO_DUR}:r=30" \
        -i "$AUDIO" \
        -c:v libx264 -crf 18 -preset slow \
        -c:a aac -b:a 192k -ar 48000 \
        -shortest -pix_fmt yuv420p -movflags +faststart \
        "$OUTPUT"
    fi
    ;;

  tk-mantra)
    # 1080p still + audio
    ffmpeg -y -loop 1 -i "$VISUAL" -i "$AUDIO" \
      -c:v libx264 -tune stillimage -crf 23 -preset slow \
      -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x050505,fps=30" \
      -c:a aac -b:a 256k -ar 48000 \
      -shortest -pix_fmt yuv420p -movflags +faststart \
      "$OUTPUT"
    ;;

  control-tapes)
    # 1080p still + audio + film grain overlay
    ffmpeg -y -loop 1 -i "$VISUAL" -i "$AUDIO" \
      -c:v libx264 -tune stillimage -crf 20 -preset slow \
      -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0a0908, \
           noise=alls=8:allf=t,fps=30" \
      -c:a aac -b:a 256k -ar 48000 \
      -shortest -pix_fmt yuv420p -movflags +faststart \
      "$OUTPUT"
    ;;

  *)
    echo "Unknown series: $SERIES"
    exit 1
    ;;
esac

echo "  ✓ Assembled: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"

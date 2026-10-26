#!/bin/sh
set -e
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
FPS=12
SECONDS_TOTAL=13
rm -rf frames && mkdir frames
n=$((FPS * SECONDS_TOTAL))
i=1
while [ $i -le $n ]; do
  t=$(echo "scale=3; ($i - 1) / $FPS" | bc)
  "$CHROME" --headless=new --hide-scrollbars --window-size=960,540 --virtual-time-budget=3000 \
    --screenshot="frames/f$(printf %03d $i).png" "file://$PWD/how-it-works.html?t=$t" 2>/dev/null
  i=$((i + 1))
done
ffmpeg -v error -y -framerate $FPS -i frames/f%03d.png -vf "split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5" -loop 0 ../assets/how-it-works.gif
ffmpeg -v error -y -framerate $FPS -i frames/f%03d.png -pix_fmt yuv420p -vf scale=960:-2 ../assets/how-it-works.mp4
rm -rf frames

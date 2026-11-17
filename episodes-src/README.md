# Episode sources (Nova)

Animated episodes are generated, not hand-animated. Each episode folder holds one `script.py`
(lines, chapters, recap and the panel drawings). The engine draws every frame with cairo and
encodes with ffmpeg; voices come from the Kokoro TTS model (Nova = af_bella, fixed pitch and speed).

    pip install kokoro-onnx soundfile pycairo scipy numpy
    # model files: kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases, in /tmp/tts/
    python engine.py voice s0p1      # synthesise lines -> lines.json, voice_*.wav
    python engine.py audio s0p1      # music + effects + voices -> mix.wav
    python engine.py render s0p1 0 999 v   # frames -> v.mp4
    ffmpeg -i s0p1/v.mp4 -i s0p1/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 30 -tune animation -c:a aac -b:a 96k -ac 1 -movflags +faststart ../public/episodes/s0p1-start.mp4

Then register the episode in `src/content/episodes.ts`. Fixed in every episode: context card, progress
bar, at most 3 ideas, a prediction moment, recap, next step, calm visuals.

"""Fish Audio TTS Generation & Word-Level Alignment Pipeline
Voice: https://fish.audio/m/5233336f5f44460ea0902b0802375451 (Mommy)
"""

import os
import sys
import json
import re
import argparse
import subprocess
import requests

# Default configuration
DEFAULT_VOICE_ID = "5233336f5f44460ea0902b0802375451"

PARAGRAPHS = [
    {
        "id": 1,
        "text": (
            "Marie Curie is one of the most famous women scientists in history. "
            "She was born Maria Sklodowska in Poland in 1867. "
            "She became well known for her groundbreaking research on radioactivity and was awarded two Nobel Prizes. "
            "In 1903, she shared the Nobel Prize in Physics with her husband, Pierre Curie, and Henri Becquerel. "
            "In 1911, she received the Nobel Prize in Chemistry on her own. "
            "She was the first woman ever to win a Nobel Prize."
        )
    },
    {
        "id": 2,
        "text": (
            "From an early age, Marie showed remarkable intelligence and an excellent memory. "
            "At the age of sixteen, she received a gold medal for completing her secondary education. "
            "However, her father lost his savings because of poor investments, so Marie had to work as a teacher. "
            "She used the money she earned to support her sister Bronia’s medical studies in Paris. "
            "In return, Bronia promised to help Marie pursue her own education later."
        )
    },
    {
        "id": 3,
        "text": (
            "In 1891, Bronia kept this promise, and Marie moved to Paris to study at the Sorbonne, now part of the University of Paris. "
            "She devoted herself to her studies, often working late into the night. "
            "Because she had very little money, she survived on a simple diet of bread, butter, and tea. "
            "Despite these difficult living conditions, she performed exceptionally well in her examinations. "
            "In 1893, she achieved the highest result in the physical sciences examination. "
            "The following year, she came second in the mathematical sciences examination. "
            "It was not until the spring of 1894 that she met Pierre Curie, who would later become her husband and research partner."
        )
    }
]

def load_dotenv(env_path):
    """Simple .env loader if python-dotenv is not installed."""
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip("'\"")
            if k and k not in os.environ:
                os.environ[k] = v

def generate_via_fish_audio(api_key, text, output_file, voice_id):
    """Generate audio using Fish Audio native TTS API."""
    url = "https://api.fish.audio/v1/tts"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "reference_id": voice_id,
        "format": "mp3",
        "latency": "normal"
    }
    print(f"Calling Fish Audio API for {len(text)} chars (voice: {voice_id})...")
    res = requests.post(url, headers=headers, json=payload, timeout=90)
    if res.status_code != 200:
        raise RuntimeError(f"Fish Audio error {res.status_code}: {res.text}")
    with open(output_file, "wb") as f:
        f.write(res.content)
    print(f"Saved: {output_file} ({len(res.content)} bytes)")

def generate_via_openrouter(api_key, text, output_file, voice_id):
    """Generate audio using OpenRouter Audio Speech endpoint."""
    url = "https://openrouter.ai/api/v1/audio/speech"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "fish-audio/s2.1-pro-free",
        "input": text,
        "voice": voice_id,
        "response_format": "mp3"
    }
    print(f"Calling OpenRouter API for {len(text)} chars (model: fish-audio/s2.1-pro-free, voice: {voice_id})...")
    res = requests.post(url, headers=headers, json=payload, timeout=90)
    if res.status_code != 200:
        raise RuntimeError(f"OpenRouter error {res.status_code}: {res.text}")
    with open(output_file, "wb") as f:
        f.write(res.content)
    print(f"Saved: {output_file} ({len(res.content)} bytes)")

def concatenate_paragraphs(p1_path, p2_path, p3_path, out_path, pause_duration=0.5):
    """Concatenate 3 paragraph files with silence pauses in between."""
    silence_file = os.path.join(os.path.dirname(out_path), "temp_silence.mp3")
    # Generate silence
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi", "-t", str(pause_duration),
        "-i", "anullsrc=r=44100:cl=mono",
        silence_file
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Concat
    subprocess.run([
        "ffmpeg", "-y",
        "-i", p1_path,
        "-i", silence_file,
        "-i", p2_path,
        "-i", silence_file,
        "-i", p3_path,
        "-filter_complex", "[0:a][1:a][2:a][3:a][4:a]concat=n=5:v=0:a=1[out]",
        "-map", "[out]",
        out_path
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    if os.path.exists(silence_file):
        os.remove(silence_file)
    print(f"Successfully concatenated full audio to {out_path}")

def run_alignment(audio_path, output_json):
    """Run Whisper on the audio file with word timestamps."""
    import whisper
    print(f"Loading Whisper base model to align {audio_path}...")
    model = whisper.load_model("base")
    result = model.transcribe(audio_path, word_timestamps=True, language="en")

    words_data = []
    sentences_data = []

    for segment in result["segments"]:
        sentences_data.append({
            "id": segment["id"],
            "start": round(segment["start"], 3),
            "end": round(segment["end"], 3),
            "text": segment["text"].strip()
        })
        if "words" in segment:
            for w in segment["words"]:
                words_data.append({
                    "word": w["word"].strip(),
                    "start": round(w["start"], 3),
                    "end": round(w["end"], 3)
                })

    duration = round(result["segments"][-1]["end"], 3) if result["segments"] else 0
    alignment_data = {
        "audioFile": "/audio/" + os.path.basename(audio_path),
        "duration": duration,
        "sentences": sentences_data,
        "words": words_data
    }

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(alignment_data, f, indent=2, ensure_ascii=False)
    print(f"Saved alignment to {output_json} (Words: {len(words_data)}, Sentences: {len(sentences_data)})")
    return alignment_data

def clean_word(w):
    return re.sub(r"[^a-zA-Z0-9]", "", w).lower()

def map_timings_to_passage(alignment_data, timing_json_path, ts_export_path):
    """Map Whisper word timestamps to exact character offsets in each paragraph."""
    whisper_words = alignment_data["words"]
    duration = alignment_data["duration"]
    aligned_paragraphs = []
    w_idx = 0

    for para in PARAGRAPHS:
        text = para["text"]
        words_in_text = []
        for m in re.finditer(r"[A-Za-z0-9À-ÿ’'-]+", text):
            raw = m.group(0)
            c = clean_word(raw)
            if c:
                words_in_text.append({
                    "word": raw,
                    "clean": c,
                    "start": m.start(),
                    "end": m.end()
                })

        para_words = []
        for item in words_in_text:
            target = item["clean"]
            matched_start = None
            matched_end = None

            search_limit = min(w_idx + 6, len(whisper_words))
            found = False
            for look in range(w_idx, search_limit):
                ww = clean_word(whisper_words[look]["word"])
                if ww == target or target in ww or ww in target:
                    matched_start = whisper_words[look]["start"]
                    matched_end = whisper_words[look]["end"]
                    w_idx = look + 1
                    found = True
                    break

            if not found and w_idx < len(whisper_words):
                matched_start = whisper_words[w_idx]["start"]
                matched_end = whisper_words[w_idx]["end"]
                w_idx += 1

            para_words.append({
                "start": item["start"],
                "end": item["end"],
                "audioStart": matched_start if matched_start is not None else 0,
                "audioEnd": matched_end if matched_end is not None else 0
            })

        aligned_paragraphs.append({
            "paragraphId": para["id"],
            "words": para_words
        })

    result = {
        "audioSrc": "/audio/marie-curie.mp3",
        "duration": duration,
        "paragraphs": aligned_paragraphs
    }

    with open(timing_json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"Saved mapped timings to {timing_json_path}")

    # Export TypeScript file
    ts_content = f"""export interface WordTiming {{
  start: number;
  end: number;
  audioStart: number;
  audioEnd: number;
}}

export interface ParagraphTiming {{
  paragraphId: number;
  words: WordTiming[];
}}

export interface AudioPassageConfig {{
  audioSrc: string;
  duration: number;
  paragraphs: ParagraphTiming[];
}}

export const MARIE_CURIE_AUDIO: AudioPassageConfig = {json.dumps(result, indent=2)};
"""
    with open(ts_export_path, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Updated TypeScript config at {ts_export_path}")

def main():
    parser = argparse.ArgumentParser(description="Fish Audio TTS & Alignment Tool")
    parser.add_argument("--voice-id", default=DEFAULT_VOICE_ID, help="Voice Model ID on Fish Audio")
    parser.add_argument("--fish-key", help="Fish Audio API Key")
    parser.add_argument("--openrouter-key", help="OpenRouter API Key")
    parser.add_argument("--input-p1", help="Path to Paragraph 1 MP3")
    parser.add_argument("--input-p2", help="Path to Paragraph 2 MP3")
    parser.add_argument("--input-p3", help="Path to Paragraph 3 MP3")
    parser.add_argument("--input-full", help="Path to complete Marie Curie MP3")
    parser.add_argument("--align-only", action="store_true", help="Only run Whisper alignment on existing public/audio/marie-curie.mp3")

    args = parser.parse_args()

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    env_file = os.path.join(root_dir, ".env")
    load_dotenv(env_file)

    audio_dir = os.path.join(root_dir, "public", "audio")
    os.makedirs(audio_dir, exist_ok=True)
    full_audio_path = os.path.join(audio_dir, "marie-curie.mp3")
    alignment_json = os.path.join(audio_dir, "marie-curie-alignment.json")
    timing_json = os.path.join(audio_dir, "marie-curie-timing.json")
    ts_path = os.path.join(root_dir, "src", "data", "marieCurieAudio.ts")

    fish_key = args.fish_key or os.environ.get("FISH_AUDIO_API_KEY")
    openrouter_key = args.openrouter_key or os.environ.get("OPENROUTER_API_KEY")

    if args.align_only:
        print("Running alignment on existing audio...")
    elif args.input_full:
        import shutil
        shutil.copy2(args.input_full, full_audio_path)
        print(f"Copied full audio from {args.input_full} to {full_audio_path}")
    elif args.input_p1 and args.input_p2 and args.input_p3:
        p1 = os.path.join(audio_dir, "paragraph-1.mp3")
        p2 = os.path.join(audio_dir, "paragraph-2.mp3")
        p3 = os.path.join(audio_dir, "paragraph-3.mp3")
        import shutil
        shutil.copy2(args.input_p1, p1)
        shutil.copy2(args.input_p2, p2)
        shutil.copy2(args.input_p3, p3)
        concatenate_paragraphs(p1, p2, p3, full_audio_path)
    elif fish_key:
        print(f"Using Fish Audio native API with voice ID: {args.voice_id}")
        p1 = os.path.join(audio_dir, "paragraph-1.mp3")
        p2 = os.path.join(audio_dir, "paragraph-2.mp3")
        p3 = os.path.join(audio_dir, "paragraph-3.mp3")
        generate_via_fish_audio(fish_key, PARAGRAPHS[0]["text"], p1, args.voice_id)
        generate_via_fish_audio(fish_key, PARAGRAPHS[1]["text"], p2, args.voice_id)
        generate_via_fish_audio(fish_key, PARAGRAPHS[2]["text"], p3, args.voice_id)
        concatenate_paragraphs(p1, p2, p3, full_audio_path)
    elif openrouter_key:
        print(f"Using OpenRouter API with voice ID: {args.voice_id}")
        p1 = os.path.join(audio_dir, "paragraph-1.mp3")
        p2 = os.path.join(audio_dir, "paragraph-2.mp3")
        p3 = os.path.join(audio_dir, "paragraph-3.mp3")
        generate_via_openrouter(openrouter_key, PARAGRAPHS[0]["text"], p1, args.voice_id)
        generate_via_openrouter(openrouter_key, PARAGRAPHS[1]["text"], p2, args.voice_id)
        generate_via_openrouter(openrouter_key, PARAGRAPHS[2]["text"], p3, args.voice_id)
        concatenate_paragraphs(p1, p2, p3, full_audio_path)
    else:
        print("\n[!] No API key or input audio provided.")
        print(f"Voice target: https://fish.audio/m/{args.voice_id} (Mommy)")
        print("\nYou can either:")
        print("  1. Run with Fish Audio API Key:")
        print(f"     python scripts/fish_audio_pipeline.py --fish-key YOUR_KEY")
        print("  2. Run with OpenRouter API Key:")
        print(f"     python scripts/fish_audio_pipeline.py --openrouter-key YOUR_KEY")
        print("  3. Download MP3 from https://fish.audio/m/{args.voice_id} and run:")
        print("     python scripts/fish_audio_pipeline.py --input-p1 p1.mp3 --input-p2 p2.mp3 --input-p3 p3.mp3")
        print("     or:")
        print("     python scripts/fish_audio_pipeline.py --input-full passage.mp3")
        sys.exit(1)

    # Perform alignment
    alignment_data = run_alignment(full_audio_path, alignment_json)
    map_timings_to_passage(alignment_data, timing_json, ts_path)
    print("\n[SUCCESS] Voice setup and word alignment complete!")

if __name__ == "__main__":
    main()

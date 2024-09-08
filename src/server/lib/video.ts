import { env } from "~/env";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

type CharacterEndTime = {
  character: string;
  endTime: number;
};

type TransformedElevenLabsApiResponse = {
  audioBase64: string;
  characterEndTimes: CharacterEndTime[];
};

type ElevenLabsApiResponse = {
  audio_base64: string;
  character_end_times_seconds: number[];
  characters: string[];
};

export type Font = keyof typeof fontToFontFile;

const CHARACTERS_PER_LINE = 15;
const SCREEN_WIDTH = 404;
const SCREEN_PADDING = 80;
const ELEVEN_LABS_TEXT_TO_SPEECH_API_URL =
  "https://api.elevenlabs.io/v1/text-to-speech/";

const fontToFontFile = {
  helvetica: "Helvetica-Bold.ttf",
};

export function encryptApiKey(apiKey: string) {
  return CryptoJS.AES.encrypt(apiKey, env.ENCRYPTION_SECRET_KEY).toString();
}

export function decryptAPIKey(encryptedKey: string) {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, env.ENCRYPTION_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function escapeTextForFfmpeg(text: string) {
  return text
    .replaceAll("\\", "\\\\\\\\\\\\\\\\")
    .replaceAll("'", "\\\\\\'")
    .replaceAll("%", "\\\\\\\\\\%")
    .replaceAll(":", "\\\\\\\\\\\\:");
}

export async function getElevenLabsTextToSpeechData(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<TransformedElevenLabsApiResponse> {
  const response = await fetch(
    ELEVEN_LABS_TEXT_TO_SPEECH_API_URL + `${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    },
  );

  const data = (await response.json()) as ElevenLabsApiResponse;

  const characterEndTimes = data.character_end_times_seconds.map(
    (endTime, index) => {
      return {
        character: data.characters[index]!,
        endTime: endTime,
      };
    },
  );

  return {
    audioBase64: data.audio_base64,
    characterEndTimes,
  };
}

export function getFfmpegVideoTextFilters(
  characterEndTimes: CharacterEndTime[],
  wordsPerCaption: number,
  fontSize: number,
  fontColor: string,
  font: Font,
  backgroundColor: string,
) {
  const fontFile = fontToFontFile[font];
  const words = escapeTextForFfmpeg(
    characterEndTimes.map((character) => character.character).join(""),
  ).split(" ");
  const wordEndTimes = [];

  let currentCharIndex = 0;
  for (const word of words) {
    currentCharIndex += word.length - 1;
    wordEndTimes.push(characterEndTimes[currentCharIndex]?.endTime);
    currentCharIndex += 2;
  }

  const textFilters = [];
  for (let i = 0; i < wordEndTimes.length; i += wordsPerCaption) {
    const selectedEndTimes = wordEndTimes.slice(i, i + wordsPerCaption);
    const selectedWords = words.slice(i, i + wordsPerCaption);
    const lines: { word: string; endTime: number }[][] = [];

    let currentPixelWidth = 0;
    for (let j = 0; j < selectedWords.length; j++) {
      const word = selectedWords[j]!;
      const endTime = selectedEndTimes[j]!;
      if (lines.length === 0) {
        lines.push([
          {
            word,
            endTime,
          },
        ]);
        continue;
      }

      for (const _ of word) {
        currentPixelWidth += fontSize;
        if (currentPixelWidth >= SCREEN_WIDTH - SCREEN_PADDING) {
          lines.push([
            {
              word,
              endTime,
            },
          ]);
          break;
        }
      }

      if (
        currentPixelWidth < SCREEN_WIDTH - SCREEN_PADDING &&
        lines.length > 0
      ) {
        lines[lines.length - 1]?.push({
          word,
          endTime,
        });
      } else {
        currentPixelWidth = 0;
      }

    }

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j]!;
      const joinedWords = line.map((line) => line.word).join(" ");
      const endTime = lines.at(-1)?.at(-1)?.endTime;
      let startTime = 0;
      if (i > 0) {
        const prevEndTimes = wordEndTimes.slice(i - wordsPerCaption, i);
        startTime = prevEndTimes[prevEndTimes.length - 1]!;
      }

      const filter =
        `drawtext=text='${joinedWords}':` +
        `fontfile=${fontFile}:` +
        `fontcolor=${fontColor}:` +
        `fontsize=${fontSize}:` +
        `box=1:boxcolor=${backgroundColor}@0.8:` +
        `x=(w-text_w)/2:y=(h-text_h)/2+${50 + j * 50}:` +
        `enable='between(t, ${startTime}, ${endTime})'`;

      textFilters.push(filter);
    }
  }
  return textFilters;
  //   return `drawtext=text='${escape(
  //     line
  // )}':fontfile=${pathToHelveticaBold}:fontcolor=white:fontsize=42:x=(w-text_w)/2:y=(h-text_h)/2+${
  //     50 + index * 50
  // }:box=1:boxcolor=black@0.8:enable='between(t,${
  //     caption.start
  // },${caption.end})'`;
}

const BASE_DIR = path.resolve("files");

function isValidFilename(filename: string): boolean {
  const validFilenameRegex = /^[a-zA-Z0-9_\-\.]+$/;
  return validFilenameRegex.test(filename);
}

export async function generateVideo(
  audioBase64: string,
  textFilters: string[],
  baseFootageFilename: string,
  videoLength: number,
): Promise<{ error: string | null; videoUrl: string | null }> {
  return new Promise((resolve) => {
    if (!isValidFilename(baseFootageFilename)) {
      resolve({ error: "Invalid filename", videoUrl: null });
      return;
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const audioPath = path.join(BASE_DIR, "audio.mp3");
    fs.writeFileSync(audioPath, audioBuffer);

    const outputPath = path.join(BASE_DIR, "output.mp4");
    const finalOutputPath = path.join(BASE_DIR, "final_output.mp4");
    const baseFootagePath = path.join(BASE_DIR, baseFootageFilename);

    ffmpeg.ffprobe(baseFootagePath, (err, metadata) => {
      if (err) {
        resolve({ error: err as string, videoUrl: null });
        return;
      }
      const videoDuration = metadata.format.duration;
      if (!videoDuration) {
        resolve({ error: "Video duration not found", videoUrl: null });
        return;
      }

      const maxStartTime = videoDuration - videoLength;
      const startTime = Math.random() * maxStartTime;

      ffmpeg(baseFootagePath)
        .setStartTime(startTime)
        .setDuration(videoLength)
        .videoFilters(`crop=ih*9/16:ih,${textFilters.join(",")}`)
        .outputOptions("-an")
        .output(outputPath)
        .on("end", () => {
          ffmpeg(outputPath)
            .addInput(audioPath)
            .outputOptions("-c:v copy")
            .output(finalOutputPath)
            .on("end", () => {
              fs.unlinkSync(audioPath);
              resolve({ error: null, videoUrl: finalOutputPath });
            })
            .on("error", (err) => {
              fs.unlinkSync(audioPath);
              resolve({ error: err.message, videoUrl: null });
            })
            .run();
        })
        .on("error", (err) => {
          fs.unlinkSync(audioPath);
          resolve({ error: err.message, videoUrl: null });
        })
        .run();
    });
  });
}

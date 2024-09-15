/* eslint-disable */
import { env } from "~/env";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { Font } from "~/app/create-video/page";
import CryptoJS from "crypto-js";
import { execSync } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { Storage } from '@google-cloud/storage';

export const GC_VIDEO_BUCKET_NAME = "vidgen-videos"

const storage = new Storage({
  projectId: env.GC_PROJECT_ID,
  credentials: {
    client_email: env.GC_EMAIL,
    private_key: env.GC_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
  }
});

export async function uploadFileToGCS(base64Data: string, fileName: string) {
  const base64Content = base64Data.split(',')[1]; // This removes the data URI prefix
  if (!base64Content) {
    throw new Error('Base64 content not found');
  }
  const buffer = Buffer.from(base64Content, 'base64');

  console.log('Buffer created. Size:', buffer.length);

  // Create a reference to the file in the bucket
  const file = storage.bucket(GC_VIDEO_BUCKET_NAME).file(fileName);

  // Upload the buffer
  await file.save(buffer, {
    contentType: 'video/mp4', // Adjust contentType as needed
  });

}

function getWordWidth(word: string, font: string, fontSize: number) {
  // Create a temporary file to store the output
  const tempFile = path.join(__dirname, "temp_output" + uuidv4() + ".txt");
  const filteredWord = filterTextForFfmpeg(word);

  const ffmpegCommand = `ffmpeg -v 24 -hide_banner -f lavfi -i color -vf "drawtext=fontfile='${font}':fontsize=${fontSize}:text='${filteredWord}':x=print(tw\\,24):y=H/2" -vframes 1 -f null - 2> ${tempFile}`;

  try {
    // Execute the command
    execSync(ffmpegCommand, { stdio: "ignore" });

    // Read the output from the temporary file
    const output = fs.readFileSync(tempFile, "utf-8");
    console.log("FFmpeg output:", output);

    // Parse the width from the output
    const width = parseFloat(output.trim());

    if (isNaN(width)) {
      throw new Error("Failed to parse word width from FFmpeg output");
    }

    // Clean up the temporary file
    fs.unlinkSync(tempFile);

    return width;
  } catch (error) {
    console.error(`Error executing FFmpeg command with word: ${word}`, error);
    // Clean up the temporary file in case of error
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    return fontSize * word.length;
  }
}

type CharacterStartAndEndTime = {
  character: string;
  endTime: number;
  startTime: number;
};

type TransformedElevenLabsApiResponse = {
  audioBase64: string;
  characterStartAndEndTimes: CharacterStartAndEndTime[];
};

type ElevenLabsApiResponse = {
  audio_base64: string;
  alignment: {
    character_end_times_seconds: number[];
    character_start_times_seconds: number[];
    characters: string[];
  };
};

const SCREEN_WIDTH = 608;
const SCREEN_PADDING = 80;
const ELEVEN_LABS_TEXT_TO_SPEECH_API_URL =
  "https://api.elevenlabs.io/v1/text-to-speech/";

export const fontToFontUrl: {
  [key in Font]: string;
} = {
  helvetica: "https://storage.googleapis.com/vidgen-footage/Helvetica-Bold.ttf",
  arial: "https://storage.googleapis.com/vidgen-footage/ArialCEMTBlack.ttf",
};

const fontToSizeMultiplier: {
  [key in Font]: number;
} = {
  helvetica: (9 / 12),
  arial: (10 / 12)
};

export function encryptApiKey(apiKey: string) {
  return CryptoJS.AES.encrypt(apiKey, env.ENCRYPTION_SECRET_KEY).toString();
}

export function decryptAPIKey(encryptedKey: string) {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, env.ENCRYPTION_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// yeah its bs but it works
// ffmpeg doesn't like certain characters in text filters so we remove them
// This is a hack pretty much, but nothing is working so fuck it
function filterTextForFfmpeg(text: string) {
  return text
    .replaceAll("\\", "\\\\\\\\\\\\\\\\")
    .replaceAll("'", "")
    .replaceAll("%", "\\\\\\\\\\%")
    .replaceAll(":", "\\\\\\\\\\\\:");
}

export async function getElevenLabsTextToSpeechData(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<TransformedElevenLabsApiResponse> {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  };
  const response = await fetch(
    ELEVEN_LABS_TEXT_TO_SPEECH_API_URL + `${voiceId}/with-timestamps`,
    requestOptions,
  );

  const data = (await response.json()) as ElevenLabsApiResponse;

  const characterStartAndEndTimes =
    data?.alignment?.character_end_times_seconds?.map((endTime, index) => {
      return {
        character: data?.alignment?.characters[index] ?? "",
        startTime: data?.alignment?.character_start_times_seconds[index] ?? 0,
        endTime: endTime,
      };
    }) ?? [];

  return {
    audioBase64: data.audio_base64,
    characterStartAndEndTimes,
  };
}

export async function getFfmpegVideoTextFilters(
  characterStartAndEndTimes: CharacterStartAndEndTime[],
  wordsPerCaption: number,
  fontSize: number,
  fontColor: string,
  font: Font,
  backgroundColor: string,
  showBackground: boolean,
  textBorderColor: string,
  textBorderSize: number,
  showBorder: boolean,
) {
  const fontUrl = fontToFontUrl[font];
  const fontFilePath = path.join(TEMP_DIR, fontUrl.split("/").pop() ?? "font.ttf");
  const words = characterStartAndEndTimes
    .map((character) => character.character)
    .join("")
    .split(" ");

  const wordStartAndEndTimes: {
    startTime: number;
    endTime: number;
    word: string;
  }[] = [];

  let currentCharIndex = 0;
  for (const word of words) {
    const startTime =
      characterStartAndEndTimes[currentCharIndex]?.startTime ?? 0;
    const endTime =
      characterStartAndEndTimes[currentCharIndex + word.length - 1]?.endTime ??
      0;
    wordStartAndEndTimes.push({
      startTime,
      endTime,
      word,
    });
    currentCharIndex += word.length + 1; // +1 for the space
  }

  const textFilters = [];
  for (let i = 0; i < wordStartAndEndTimes.length; i += wordsPerCaption) {
    const selectedWords = wordStartAndEndTimes.slice(i, i + wordsPerCaption);
    const groupStartTime = selectedWords[0]?.startTime ?? 0;
    const groupEndTime = selectedWords[selectedWords.length - 1]?.endTime ?? 0;

    const lines: { text: string; startTime: number; endTime: number }[] = [];
    let currentLine: string[] = [];
    let currentLineWidth = 0;

    for (const wordInfo of selectedWords) {
      const wordWidth = (fontSize * fontToSizeMultiplier[font] ?? 1) * wordInfo.word.length

      if (currentLineWidth + wordWidth > SCREEN_WIDTH - SCREEN_PADDING) {
        if (currentLine.length > 0) {
          lines.push({
            text: currentLine.join(" "),
            startTime: groupStartTime,
            endTime: groupEndTime,
          });
          currentLine = [];
          currentLineWidth = 0;
        }
      }

      currentLine.push(wordInfo.word);
      currentLineWidth += wordWidth + (currentLine.length > 1 ? fontSize : 0); // Add space width except for first word
    }

    if (currentLine.length > 0) {
      lines.push({
        text: currentLine.join(" "),
        startTime: groupStartTime,
        endTime: groupEndTime,
      });
    }

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j]!;
      const heightOffset = fontSize * j + 20;
      const filteredText = filterTextForFfmpeg(line.text);

      const filter =
        `drawtext=text='${filteredText}':` +
        `fontfile=${fontFilePath}:` +
        `fontcolor=${fontColor}:` +
        `fontsize=${fontSize}:` +
        (showBackground ? `box=1:boxcolor=${backgroundColor}@0.8:` : "") +
        (showBorder
          ? `borderw=${textBorderSize}:bordercolor=${textBorderColor}:`
          : "") +
        `boxborderw=${10}:` +
        `x=(w-text_w)/2:y=(h-text_h)/2+${heightOffset}:` +
        `enable='between(t, ${line.startTime}, ${line.endTime})'`;

      textFilters.push(filter);
    }
  }

  return textFilters;
}

const TEMP_DIR = path.resolve("/tmp"); // Use /tmp, as it's commonly writable in serverless environments

// Ensure the directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

export async function generateVideoCloudFn(
  audioBase64: string,
  textFilters: string[],
  baseFootageUrl: string,
  videoLength: number,
  fontUrl: string,
) {
  const response = await fetch('https://generate-vid-787151393927.us-central1.run.app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioBase64, textFilters, footageUrl: baseFootageUrl, videoLength, fontUrl
    }),
  });

  const result = await response.json();
  if (result.error) {
    return {
      error: (result.error ?? "") as string,
      videoUrl: null,
    }
  } else {
    return {
      error: null,
      videoUrl: (result.videoUrl ?? "") as string,
    }
  }
}

export async function generateVideo(
  audioBase64: string,
  textFilters: string[],
  baseFootageUrl: string,
  videoLength: number,
  onProgress: (progress: number) => Promise<void>,
): Promise<{ error: string | null; videoUrl: string | null }> {
  return new Promise((resolve) => {
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const audioPath = path.join(TEMP_DIR, "audio.mp3");
    fs.writeFileSync(audioPath, audioBuffer);
    const outputPath = path.join(TEMP_DIR, "output.mp4");
    const finalOutputPath = path.join(TEMP_DIR, "final_output.mp4");

    ffmpeg.ffprobe(baseFootageUrl, (err, metadata) => {
      if (err) {
        resolve({ error: (err as any).message, videoUrl: null });
        return;
      }
      const videoDuration = metadata.format.duration;
      if (!videoDuration) {
        resolve({ error: "Video duration not found", videoUrl: null });
        return;
      }
      const maxStartTime = videoDuration - videoLength;
      const startTime = Math.random() * maxStartTime;
      ffmpeg(baseFootageUrl)
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
            .on("end", async () => {
              try {
                fs.unlink(audioPath, (err) => {
                  if (err) {
                    console.error(err);
                  }
                });
                fs.unlink(outputPath, (err) => {
                  if (err) {
                    console.error(err);
                  }
                });

                // Read the final video file and convert to base64
                const videoBuffer = fs.readFileSync(finalOutputPath);
                const base64Video = videoBuffer.toString("base64");
                const videoUrl = `data:video/mp4;base64,${base64Video}`;

                fs.unlink(finalOutputPath, (err) => {
                  if (err) {
                    console.error(err);
                  }
                });

                resolve({ error: null, videoUrl });
              } catch (error) {
                resolve({
                  error: (error as any).message,
                  videoUrl: null,
                });
              }
            })
            .on("error", async (err) => {
              fs.unlink(audioPath, (err) => {
                if (err) {
                  console.error(err);
                }
              });
              resolve({ error: err.message, videoUrl: null });
            })
            .run();
        })
        .on("error", async (err) => {
          fs.unlink(audioPath, (err) => {
            if (err) {
              console.error(err);
            }
          });
          resolve({ error: err.message, videoUrl: null });
        })
        .on("progress", async (progress) => {
          await onProgress(progress.percent ?? 0);
        })
        .run();
    });
  });
}


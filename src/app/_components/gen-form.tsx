"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

const voices = {
  Adam: "pNInz6obpgDQGcFmaJgB",
  Antoni: "ErXwobaYiN019PkySvjV",
  Arnold: "VR6AewLTigWG4xSOukaG",
  Clyde: "2EiwWnXFnvU5JabPnv8n",
  Dave: "CYw3kZ02Hs0563khs1Fj",
  Dorothy: "ThT5KcBeYPX3keUQqHPh",
  Drew: "29vD33N1CtxCmqQRPOHJ",
  Emily: "LcfcDJNUP1GQjkzn1xUU",
  Ethan: "g5CIjZEefAph4nQFvHAz",
  Fin: "D38z5RcWu1voky8WS1ja",
  Sarah: "EXAVITQu4vr4xnSDxMaL",
  Laura: "FGY2WhTYpPnrIDTdsKH5",
  Charlie: "IKne3meq5aSn9XLyUdCD",
  George: "JBFqnCBsd6RMkjVDRZzb",
  Callum: "N2lVS1w4EtoT3dr4eOWO",
  Liam: "TX3LPaxmHKxFdv7VOQHJ",
  Charlotte: "XB0fDUnXU5powFXDhCwa",
  Alice: "Xb7hH8MSUJpSbSDYk0k2",
  Matilda: "XrExE9yKIg1WjnnlVkGX",
  Will: "bIHbv24MWmeRgasZH58o",
  Jessica: "cgSgspJ2msm6clMCkdW9",
  Eric: "cjVigY5qzO86Huf0OWal",
  Chris: "iP95p4xoKVk53GoZ742B",
  Brian: "nPczCjzI2devNBz1zQrb",
  Daniel: "onwK4e9ZLuTAKqWW03F9",
  Lily: "pFZP5JQG7iQjIQuC4Bku",
  Bill: "pqHfZKP75CvOlQylNhV4",
};

export function GenForm() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { mutate } = api.video.generateVideo.useMutation({
    onSuccess: (data) => {
      setVideoUrl(data.videoUrl);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const text = formData.get("text") as string;
    const voiceId = formData.get("voiceId") as string;
    const wordsPerCaption = formData.get("wordsPerCaption") as string;
    const fontSize = formData.get("fontSize") as string;
    const fontColor = formData.get("fontColor") as string;
    const backgroundColor = formData.get("backgroundColor") as string;

    mutate({
      text,
      voiceId,
      wordsPerCaption: parseInt(wordsPerCaption, 10),
      fontSize: parseInt(fontSize, 10),
      fontColor,
      backgroundColor,
      baseFootage: "minecraft",
      font: "helvetica",
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input type="text" name="text" placeholder="Text" />
        <select name="voiceId">
          {Object.entries(voices).map(([name, id]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="wordsPerCaption"
          placeholder="Words per caption"
        />
        <input type="number" name="fontSize" placeholder="Font size" />
        <input type="color" name="fontColor" placeholder="Font color" />
        <input
          type="color"
          name="backgroundColor"
          placeholder="Background color"
        />
        <button className="rounded-md bg-red-600 p-2 text-white" type="submit">
          Generate video
        </button>
      </form>
      {videoUrl && <video src={videoUrl} controls />}
    </div>
  );
}

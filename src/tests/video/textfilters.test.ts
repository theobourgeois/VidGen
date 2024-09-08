import { expect, test } from '@jest/globals';
import { getFfmpegVideoTextFilters } from '~/server/lib/video';

const characterEndTimes = [
  { character: "h", endTime: 0.1 },
  { character: "e", endTime: 0.15 },
  { character: "l", endTime: 0.2 },
  { character: "l", endTime: 0.25 },
  { character: "o", endTime: 0.3 },
  { character: " ", endTime: 0.35 },
  { character: "w", endTime: 0.4 },
  { character: "o", endTime: 0.45 },
  { character: "r", endTime: 0.5 },
  { character: "l", endTime: 0.55 },
  { character: "d", endTime: 0.6 },
  { character: " ", endTime: 0.65 },
  { character: "m", endTime: 0.7 },
  { character: "y", endTime: 0.75 },
  { character: " ", endTime: 0.8 },
  { character: "n", endTime: 0.85 },
  { character: "a", endTime: 0.9 },
  { character: "m", endTime: 0.95 },
  { character: "e", endTime: 1.0 },
  { character: " ", endTime: 1.05 },
  { character: "i", endTime: 1.1 },
  { character: "s", endTime: 1.15 },
  { character: " ", endTime: 1.2 },
  { character: "t", endTime: 1.25 },
  { character: "h", endTime: 1.3 },
  { character: "e", endTime: 1.35 },
  { character: "o", endTime: 1.4 },
  { character: ",", endTime: 1.45 },
  { character: " ", endTime: 1.5 },
  { character: "t", endTime: 1.55 },
  { character: "h", endTime: 1.6 },
  { character: "i", endTime: 1.65 },
  { character: "s", endTime: 1.7 },
  { character: " ", endTime: 1.75 },
  { character: "i", endTime: 1.8 },
  { character: "s", endTime: 1.85 },
  { character: " ", endTime: 1.9 },
  { character: "a", endTime: 1.95 },
  { character: " ", endTime: 2.0 },
  { character: "t", endTime: 2.05 },
  { character: "e", endTime: 2.1 },
  { character: "s", endTime: 2.15 },
  { character: "t", endTime: 2.2 },
  { character: "!", endTime: 2.25 },
];

test("Writes text", () => {
  const textFilters = getFfmpegVideoTextFilters(characterEndTimes, 2, 42, "red", "helvetica", "black");

  expect(textFilters).toEqual([
    "drawtext=text='hello world':fontfile=helvetica:fontcolor=red:fontsize=42:box=1:boxcolor=black@0.8:enable='between(t, 0, 0.35)'",
    "drawtext=text='my name is theo, this is a test!':fontfile=helvetica:fontcolor=red:fontsize=42:box=1:boxcolor=black@0.8:enable='between(t, 0.35, 2.25)'",
  ]);
});

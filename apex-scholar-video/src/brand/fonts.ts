import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadSource } from "@remotion/google-fonts/SourceSans3";

export const jakarta = loadJakarta("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
export const source = loadSource("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

export const fontFamilyDisplay = jakarta.fontFamily;
export const fontFamilyBody = source.fontFamily;

export const waitForFonts = async () => {
  await Promise.all([jakarta.waitUntilDone(), source.waitUntilDone()]);
};

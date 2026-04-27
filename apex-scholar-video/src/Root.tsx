import React from "react";
import { Composition } from "remotion";
import { ApexScholarPromo, TOTAL_DURATION } from "./ApexScholarPromo";
import { waitForFonts } from "./brand/fonts";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ApexScholarPromo"
        component={ApexScholarPromo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
        calculateMetadata={async () => {
          await waitForFonts();
          return {};
        }}
      />
    </>
  );
};

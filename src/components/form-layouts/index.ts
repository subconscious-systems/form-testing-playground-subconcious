import React from "react";
import { SingleColumnLayout } from "./SingleColumnLayout";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { SplitScreenLayout } from "./SplitScreenLayout";
import { WizardStyleLayout } from "./WizardStyleLayout";
import { LayoutType } from "./types";

export const layoutComponents: Record<LayoutType, React.ComponentType<any>> = {
  'single-column': SingleColumnLayout,
  'two-column': TwoColumnLayout,
  'split-screen': SplitScreenLayout,
  'wizard-style': WizardStyleLayout,
};

export { SingleColumnLayout, TwoColumnLayout, SplitScreenLayout, WizardStyleLayout };
export type { LayoutType } from "./types";


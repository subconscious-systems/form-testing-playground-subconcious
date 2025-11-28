import React from "react";
import { SingleColumnLayout } from "./SingleColumnLayout";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { SplitScreenLayout } from "./SplitScreenLayout";
import { WizardStyleLayout } from "./WizardStyleLayout";
import { WebsiteStyleLayout } from "./WebsiteStyleLayout";
import { LayoutType } from "./types";

export const layoutComponents: Record<LayoutType, React.ComponentType<any>> = {
  'single-column': SingleColumnLayout,
  'two-column': TwoColumnLayout,
  'split-screen': SplitScreenLayout,
  'wizard-style': WizardStyleLayout,
  'website-style': WebsiteStyleLayout,
};

export { SingleColumnLayout, TwoColumnLayout, SplitScreenLayout, WizardStyleLayout, WebsiteStyleLayout };
export type { LayoutType } from "./types";


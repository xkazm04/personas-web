export interface GuideCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  /** Default mode for all topics in this category. Defaults to "both". */
  mode?: GuideMode;
}

export type GuideMode = "simple" | "power" | "both";

export interface GuideTopic {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  tags: string[];
  /** Which UI mode this topic is relevant to. Defaults to "both" if omitted. */
  mode?: GuideMode;
}

export type Feature = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
  votes: number;
};

export interface Comment {
  id: string;
  featureId: string;
  parentId: string | null;
  text: string;
  author: string;
  timestamp: number;
}

export interface AccentToken {
  r: number;
  g: number;
  b: number;
  tw: string;
}

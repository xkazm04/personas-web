export interface ToolIcon {
  src: string;
  fallback?: boolean;
}

export interface Tool {
  id: string;
  name: string;
  icon: ToolIcon;
  color: string;
  useCases: { title: string; desc: string }[];
}

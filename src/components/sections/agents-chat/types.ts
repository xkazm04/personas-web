export interface ChatMessage {
  sender: "bot" | "system";
  text: string;
  tone: "neutral" | "warning" | "error" | "success" | "thinking";
  timestamp: string;
}

export interface ChatScenario {
  id: string;
  name: string;
  userMessage: string;
  workflow: {
    messages: ChatMessage[];
    satisfaction: number;
  };
  agent: {
    messages: ChatMessage[];
    satisfaction: number;
  };
}

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

/**
 * Playback snapshot handed to each presentation variant. Both variants are
 * driven by the SAME useChatSequence() instance (hoisted in index.tsx) so
 * they stay directly comparable — switching variants mid-scenario shows the
 * exact same moment through a different metaphor.
 */
export interface ChatSequenceView {
  scenario: ChatScenario;
  wfVisibleCount: number;
  agVisibleCount: number;
  wfTyping: boolean;
  agTyping: boolean;
  showSatisfaction: boolean;
}

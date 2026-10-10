export interface AssistantQueryRequest {
  question: string;
}

export interface AssistantQueryResponse {
  question: string;
  answer: string;
  evidence: Record<string, any>;
  figures: Record<string, any>;
}

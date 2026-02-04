
export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface AnalysisResult {
  summary: string;
  characters: {
    name: string;
    description: string;
  }[];
  themes: {
    title: string;
    description: string;
  }[];
  literaryValue: string;
}

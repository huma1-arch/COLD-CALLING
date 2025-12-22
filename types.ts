export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isAudio?: boolean;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface SearchResult {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  RESEARCH = 'RESEARCH',
  ROLEPLAY = 'ROLEPLAY',
  ANALYSIS = 'ANALYSIS',
  SCRIPTING = 'SCRIPTING'
}

export interface AudioConfig {
  sampleRate: number;
}

// Prop-driven data contracts for the Call Details ("Conversation Intelligence")
// page. Reusable components consume these shapes only — no hardcoded content —
// so the page can be wired to the backend without touching presentation code.

export type CallStatus =
  | 'completed'
  | 'in-progress'
  | 'failed'
  | 'no-answer'
  | 'voicemail';

export interface CallHeaderData {
  customerName: string;
  company: string;
  phone: string;
  campaign: string;
  status: CallStatus;
  durationLabel: string; // e.g. "2m 18s"
  date: string; // ISO string
}

export type Tone = 'positive' | 'neutral' | 'attention' | 'negative' | 'accent';

export type CallKPIIcon =
  | 'lead-score'
  | 'buying-intent'
  | 'sentiment'
  | 'decision-maker'
  | 'appointment'
  | 'next-action';

export interface CallKPI {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  icon: CallKPIIcon;
}

export interface AudioRecording {
  url?: string | null; // when null/absent, the player runs in simulated mode
  durationSeconds: number;
}

export type TranscriptTag = 'question' | 'objection' | 'pricing';

export interface TranscriptSegment {
  id: string;
  speaker: 'ai' | 'customer';
  timestamp: number; // seconds from call start
  text: string;
  tags?: TranscriptTag[];
}

export interface IntelligenceMetric {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  progress?: number; // optional 0-100 for score-style metrics
}

export type AnalysisIcon =
  | 'intent'
  | 'pain'
  | 'objection'
  | 'positive'
  | 'negative';

export interface BusinessAnalysisItem {
  id: string;
  title: string;
  tone: Tone;
  icon: AnalysisIcon;
  text?: string; // paragraph style
  items?: string[]; // list style
}

export type ExtractedIcon =
  | 'company'
  | 'industry'
  | 'employees'
  | 'solution'
  | 'product'
  | 'budget'
  | 'timeline'
  | 'decision-maker';

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  icon: ExtractedIcon;
}

export interface NextAction {
  id: string;
  label: string;
  done?: boolean;
}

export type FollowUpChannel = 'email' | 'whatsapp' | 'sms';

export interface FollowUpMessage {
  channel: FollowUpChannel;
  subject?: string; // email only
  body: string;
}

export interface FollowUpData {
  messages: FollowUpMessage[];
}

export interface CoachingData {
  didWell: string[];
  needsImprovement: string[];
  suggestedPrompt: string;
}

export interface KnowledgeAnalysisData {
  answeredPercent: number;
  unansweredPercent: number;
  missingTopics: string[];
}

export interface ExecutiveReportData {
  title: string;
  body: string;
  footer: string;
}

export interface CallDetailData {
  header: CallHeaderData;
  kpis: CallKPI[];
  recording: AudioRecording | null; // null => "Recording not available"
  summary: string[] | null; // null => summary generating
  intelligence: IntelligenceMetric[];
  transcript: TranscriptSegment[] | null; // null => "Transcript processing..."
  businessAnalysis: BusinessAnalysisItem[];
  extracted: ExtractedField[];
  nextActions: NextAction[];
  followUp: FollowUpData;
  coaching: CoachingData;
  knowledge: KnowledgeAnalysisData;
  executiveReport: ExecutiveReportData;
}

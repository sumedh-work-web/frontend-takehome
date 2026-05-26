export type CallPhase = 'intro' | 'discovery' | 'demo' | 'objection' | 'close';

export type SuggestionKind =
  | 'battle_card'
  | 'missed_question'
  | 'objection_cue'
  | 'sentiment_alert';

export interface BaseCallEvent {
  id: string;
  t: number;
  type: 'transcript' | 'phase_change' | 'talk_ratio' | 'suggestion';
}

export interface TranscriptEvent extends BaseCallEvent {
  type: 'transcript';
  speaker: 'rep' | 'buyer';
  text: string;
}

export interface PhaseChangeEvent extends BaseCallEvent {
  type: 'phase_change';
  phase: CallPhase;
}

export interface TalkRatioEvent extends BaseCallEvent {
  type: 'talk_ratio';
  repPercent: number;
  buyerPercent: number;
}

export interface BaseSuggestionEvent<TKind extends SuggestionKind> extends BaseCallEvent {
  type: 'suggestion';
  suggestionType: TKind;
}

export interface BattleCardSuggestionEvent extends BaseSuggestionEvent<'battle_card'> {
  competitor: string;
  differentiators: string[];
  commonObjections: string[];
  whatNotToSay: string[];
  customerProofQuote?: string;
}

export interface MissedQuestionSuggestionEvent extends BaseSuggestionEvent<'missed_question'> {
  question: string;
  whyItMatters: string;
}

export interface ObjectionCueSuggestionEvent extends BaseSuggestionEvent<'objection_cue'> {
  objection: string;
  suggestedResponse: string;
}

export interface SentimentAlertSuggestionEvent extends BaseSuggestionEvent<'sentiment_alert'> {
  severity: 'low' | 'medium' | 'high';
  reason: string;
}

export type SuggestionEvent =
  | BattleCardSuggestionEvent
  | MissedQuestionSuggestionEvent
  | ObjectionCueSuggestionEvent
  | SentimentAlertSuggestionEvent;

export type CallEvent =
  | TranscriptEvent
  | PhaseChangeEvent
  | TalkRatioEvent
  | SuggestionEvent;

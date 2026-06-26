import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { CloseOutlined } from '@ant-design/icons';
import type { ScenarioEvent } from '../lib/scenarioPlayer';
import { useScenarioPlayer } from '../stores/RootStoreContext';
import type {
  BattleCardSuggestionEvent,
  MissedQuestionSuggestionEvent,
  ObjectionCueSuggestionEvent,
  SentimentAlertSuggestionEvent,
  SuggestionEvent,
} from '../types/events';
import { BattleCard } from './BattleCard';
import { PanelEmptyState } from './PanelEmptyState';

const FRESH_SECONDS = 30;
const STALE_BATTLE_CARD_SECONDS = 60;
const DELAYED_SECONDS = 5;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px; /* Equal top/bottom and left/right spacing for a balanced header */
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h2 {
    margin: 0;
    font-size: 15px;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
  }
`;

const Frame = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StatusPill = styled.span<{ $tone?: 'default' | 'quiet' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 9px;
  border-radius: 999px;
  background: ${({ $tone, theme }) => {
    if ($tone === 'quiet') return theme.colors.background;
    return theme.colors.accentLight;
  }};
  color: ${({ $tone, theme }) => {
    if ($tone === 'quiet') return theme.colors.muted;
    return theme.colors.accent;
  }};
  font-size: 11px;
  font-weight: 700;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: currentColor;
  }
`;

const CoachingBody = styled.div<{ $centered?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  padding: ${({ $centered }) => ($centered ? '22px' : '16px 22px 28px 22px')}; /* Standard padding with bottom safety space */
  min-height: 0;
  overflow-y: ${({ $centered }) => ($centered ? 'hidden' : 'auto')};
  align-items: ${({ $centered }) => ($centered ? 'center' : 'stretch')};
  justify-content: ${({ $centered }) => ($centered ? 'center' : 'flex-start')};
`;

const HeroWrap = styled.div`
  min-height: fit-content;
  flex-shrink: 0;
`;

const SuggestionCard = styled.article<{ $tone?: 'default' | 'warning' | 'urgent'; $variant?: 'hero' | 'queued' }>`
  position: relative;
  overflow: hidden;
  padding: ${({ $variant }) => ($variant === 'queued' ? '14px 16px' : '20px 18px 18px')};
  border: 1px solid ${({ $tone, theme }) => {
    if ($tone === 'urgent') return theme.colors.status.urgent.border;
    if ($tone === 'warning') return theme.colors.status.warning.border;
    return theme.colors.status.info.border;
  }};
  border-radius: 0;
  background: ${({ $tone, theme }) => {
    if ($tone === 'urgent') return theme.colors.status.urgent.bg;
    if ($tone === 'warning') return theme.colors.status.warning.bg;
    return theme.colors.status.info.bg;
  }};
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.02);
  transition: all 180ms ease;

  h3 {
    margin: 0;
    font-size: ${({ $variant }) => ($variant === 'queued' ? '14px' : 'clamp(16px, 2vw, 19px)')};
    line-height: 1.35;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 6px 0 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    line-height: 1.4;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`;

const DismissButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  transition: all 150ms ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(107, 114, 128, 0.1);
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DecayBar = styled.div<{ $tone?: 'default' | 'warning' | 'urgent'; $percent: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 4px;
  width: ${({ $percent }) => `${$percent * 100}%`};
  background: ${({ $tone, theme }) => {
    if ($tone === 'urgent') return theme.colors.status.urgent.text;
    if ($tone === 'warning') return theme.colors.status.warning.text;
    return theme.colors.accent;
  }};
  opacity: 0.85;
  transition: width 150ms linear;
`;

const QueueHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

const QueueList = styled.div`
  display: grid;
  gap: 10px;
`;

const EyebrowRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

const SuggestionLabel = styled.p<{ $tone?: 'default' | 'warning' | 'urgent' }>`
  && {
    margin: 0;
    color: ${({ $tone, theme }) => {
      if ($tone === 'urgent') return theme.colors.status.urgent.text;
      if ($tone === 'warning') return theme.colors.status.warning.label;
      return theme.colors.accent;
    }};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
`;

const TimingBadge = styled.span<{ $tone?: 'default' | 'warning' | 'urgent' }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border-radius: 999px;
  background: ${({ $tone, theme }) => {
    if ($tone === 'urgent') return theme.colors.status.urgent.badgeBg;
    if ($tone === 'warning') return theme.colors.status.warning.badgeBg;
    return theme.colors.background;
  }};
  color: ${({ $tone, theme }) => {
    if ($tone === 'urgent') return theme.colors.status.urgent.text;
    if ($tone === 'warning') return theme.colors.status.warning.label;
    return theme.colors.muted;
  }};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
`;

const Meta = styled.p`
  && {
    margin-top: 12px;
    font-size: 11px;
  }
`;



const InvalidBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.status.warning.badgeBg};
  color: ${({ theme }) => theme.colors.status.warning.label};
  font-size: 11px;
  font-weight: 600;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
    flex-shrink: 0;
  }
`;

interface TimedSuggestion {
  event: SuggestionEvent;
  arrivedAt: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function hasValidBase(event: Record<string, unknown>) {
  return (
    event.type === 'suggestion' &&
    isNonEmptyString(event.id) &&
    typeof event.t === 'number' &&
    Number.isFinite(event.t)
  );
}

function isMissedQuestion(
  event: Record<string, unknown>,
): event is Record<string, unknown> & MissedQuestionSuggestionEvent {
  return (
    event.suggestionType === 'missed_question' &&
    isNonEmptyString(event.question) &&
    isNonEmptyString(event.whyItMatters)
  );
}

function isObjectionCue(
  event: Record<string, unknown>,
): event is Record<string, unknown> & ObjectionCueSuggestionEvent {
  return (
    event.suggestionType === 'objection_cue' &&
    isNonEmptyString(event.objection) &&
    isNonEmptyString(event.suggestedResponse)
  );
}

function isSentimentAlert(
  event: Record<string, unknown>,
): event is Record<string, unknown> & SentimentAlertSuggestionEvent {
  return (
    event.suggestionType === 'sentiment_alert' &&
    (event.severity === 'low' || event.severity === 'medium' || event.severity === 'high') &&
    isNonEmptyString(event.reason)
  );
}

function isBattleCard(
  event: Record<string, unknown>,
): event is Record<string, unknown> & BattleCardSuggestionEvent {
  return (
    event.suggestionType === 'battle_card' &&
    isNonEmptyString(event.competitor) &&
    isStringArray(event.differentiators) &&
    event.differentiators.length > 0 &&
    isStringArray(event.commonObjections) &&
    isStringArray(event.whatNotToSay) &&
    (event.customerProofQuote === undefined || isNonEmptyString(event.customerProofQuote))
  );
}

function asSuggestion(event: ScenarioEvent): SuggestionEvent | null {
  if (!isRecord(event) || !hasValidBase(event)) return null;
  if (isMissedQuestion(event) || isObjectionCue(event) || isSentimentAlert(event) || isBattleCard(event)) {
    return event;
  }
  return null;
}

function arrivedAt(event: ScenarioEvent) {
  if ('arrivalT' in event && typeof event.arrivalT === 'number' && Number.isFinite(event.arrivalT)) {
    return event.arrivalT;
  }
  return typeof event.t === 'number' && Number.isFinite(event.t) ? event.t : 0;
}

function priority(event: SuggestionEvent) {
  if (event.suggestionType === 'sentiment_alert' && event.severity === 'high') return 6;
  if (event.suggestionType === 'objection_cue') return 5;
  if (event.suggestionType === 'missed_question') return 4;
  if (event.suggestionType === 'battle_card') return 3;
  if (event.suggestionType === 'sentiment_alert' && event.severity === 'medium') return 2;
  return 1;
}

function getValidSuggestions(events: ScenarioEvent[]) {
  const ids = new Set<string>();
  const valid: TimedSuggestion[] = [];
  let invalidCount = 0;

  events.forEach((rawEvent) => {
    if (rawEvent.type !== 'suggestion') return;
    const suggestion = asSuggestion(rawEvent);
    if (!suggestion) {
      invalidCount += 1;
      return;
    }
    if (ids.has(suggestion.id)) return;
    ids.add(suggestion.id);
    valid.push({ event: suggestion, arrivedAt: arrivedAt(rawEvent) });
  });

  return { valid, invalidCount };
}


function ageLabel(seconds: number) {
  if (seconds < 5) return 'Just surfaced';
  if (seconds < 60) return `${Math.round(seconds)}s ago`;
  return 'A moment ago';
}

function isDelayedSuggestion({ event, arrivedAt: time }: TimedSuggestion) {
  return time - event.t >= DELAYED_SECONDS;
}

function renderSuggestion(suggestion: TimedSuggestion, elapsed: number, onDismiss: () => void) {
  const { event, arrivedAt: time } = suggestion;
  const age = Math.max(0, elapsed - time);
  const delayed = isDelayedSuggestion(suggestion);
  const decayPercent = Math.max(0, Math.min(1, (FRESH_SECONDS - age) / FRESH_SECONDS));

  if (event.suggestionType === 'battle_card') {
    const stale = age > FRESH_SECONDS;
    return (
      <BattleCard
        event={event}
        delayed={delayed}
        stale={stale}
        onDismiss={onDismiss}
      />
    );
  }

  const tone = event.suggestionType === 'sentiment_alert' && event.severity === 'high'
    ? 'urgent'
    : (event.suggestionType === 'objection_cue' || (event.suggestionType === 'sentiment_alert' && event.severity === 'medium'))
      ? 'warning'
      : 'default';

  if (event.suggestionType === 'missed_question') {
    return (
      <SuggestionCard $tone={tone} $variant="hero">
        <CardHeader>
          <EyebrowRow style={{ marginBottom: 0 }}>
            <SuggestionLabel $tone={tone}>Priority cue</SuggestionLabel>
            <TimingBadge $tone={tone}>{delayed ? 'Delayed cue' : ageLabel(age)}</TimingBadge>
          </EyebrowRow>
          <DismissButton aria-label="Dismiss suggestion" onClick={onDismiss}>
            <CloseOutlined />
          </DismissButton>
        </CardHeader>
        <h3>{event.question}</h3>
        <p>{event.whyItMatters}</p>
        <DecayBar $tone={tone} $percent={decayPercent} />
      </SuggestionCard>
    );
  }

  if (event.suggestionType === 'objection_cue') {
    return (
      <SuggestionCard $tone={tone} $variant="hero">
        <CardHeader>
          <EyebrowRow style={{ marginBottom: 0 }}>
            <SuggestionLabel $tone={tone}>Priority cue</SuggestionLabel>
            <TimingBadge $tone={tone}>{delayed ? 'Delayed cue' : ageLabel(age)}</TimingBadge>
          </EyebrowRow>
          <DismissButton aria-label="Dismiss suggestion" onClick={onDismiss}>
            <CloseOutlined />
          </DismissButton>
        </CardHeader>
        <h3>{event.suggestedResponse}</h3>
        <Meta>Detected objection: {event.objection}</Meta>
        <DecayBar $tone={tone} $percent={decayPercent} />
      </SuggestionCard>
    );
  }

  // Sentiment Alert
  return (
    <SuggestionCard $tone={tone} $variant="hero">
      <CardHeader>
        <EyebrowRow style={{ marginBottom: 0 }}>
          <SuggestionLabel $tone={tone}>Priority cue</SuggestionLabel>
          <TimingBadge $tone={tone}>{delayed ? 'Delayed cue' : ageLabel(age)}</TimingBadge>
        </EyebrowRow>
        <DismissButton aria-label="Dismiss suggestion" onClick={onDismiss}>
          <CloseOutlined />
        </DismissButton>
      </CardHeader>
      <h3>{event.reason}</h3>
      <p>Stay present and adjust your approach before moving forward.</p>
      <DecayBar $tone={tone} $percent={decayPercent} />
    </SuggestionCard>
  );
}

function renderQueuedSuggestion(suggestion: TimedSuggestion, elapsed: number, onDismiss: () => void) {
  const { event, arrivedAt: time } = suggestion;
  const age = Math.max(0, elapsed - time);
  const delayed = isDelayedSuggestion(suggestion);
  const decayPercent = Math.max(0, Math.min(1, (FRESH_SECONDS - age) / FRESH_SECONDS));

  const tone = event.suggestionType === 'sentiment_alert' && event.severity === 'high'
    ? 'urgent'
    : (event.suggestionType === 'objection_cue' || (event.suggestionType === 'sentiment_alert' && event.severity === 'medium'))
      ? 'warning'
      : 'default';

  const label = event.suggestionType === 'battle_card'
    ? 'Battle card'
    : event.suggestionType === 'objection_cue'
      ? 'Objection cue'
      : event.suggestionType === 'missed_question'
        ? 'Missed question'
        : 'Sentiment alert';

  const headline = event.suggestionType === 'battle_card'
    ? `${event.competitor} battle card`
    : event.suggestionType === 'objection_cue'
      ? event.suggestedResponse
      : event.suggestionType === 'missed_question'
        ? event.question
        : event.reason;

  return (
    <SuggestionCard $tone={tone} $variant="queued">
      <CardHeader>
        <EyebrowRow style={{ marginBottom: 0 }}>
          <SuggestionLabel $tone={tone}>{label}</SuggestionLabel>
          <TimingBadge $tone={tone}>{delayed ? 'Delayed' : ageLabel(age)}</TimingBadge>
        </EyebrowRow>
        <DismissButton aria-label="Dismiss suggestion" onClick={onDismiss}>
          <CloseOutlined />
        </DismissButton>
      </CardHeader>
      <h3 style={{ fontSize: '14px', fontWeight: 600 }}>{headline}</h3>
      {event.suggestionType !== 'battle_card' && (
        <DecayBar $tone={tone} $percent={decayPercent} />
      )}
    </SuggestionCard>
  );
}

export const LiveCoaching = observer(function LiveCoaching() {
  const player = useScenarioPlayer();
  const events = player.emittedEvents;
  const { valid, invalidCount } = getValidSuggestions(events);

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  // Reset dismissed IDs when scenario changes
  useEffect(() => {
    setDismissedIds(new Set());
  }, [player.scenarioId]);

  // Remove a suggestion ID from dismissedIds if it is no longer emitted (scrubbed back)
  useEffect(() => {
    const validIds = new Set(valid.map(({ event }) => event.id));
    setDismissedIds((prev) => {
      const next = new Set<string>();
      let changed = false;
      prev.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [valid]);

  const activeSuggestions = valid
    .filter(({ event, arrivedAt: time }) => {
      if (dismissedIds.has(event.id)) return false;
      const age = player.elapsed - time;
      if (event.suggestionType === 'battle_card') {
        const hasPhaseChangeAfter = events.some(
          (candidate) => candidate.type === 'phase_change' && arrivedAt(candidate) > time
        );
        return age >= 0 && age <= STALE_BATTLE_CARD_SECONDS && !hasPhaseChangeAfter;
      }
      return age >= 0 && age <= FRESH_SECONDS;
    })
    .sort((a, b) => priority(b.event) - priority(a.event) || b.arrivedAt - a.arrivedAt);

  const hero = activeSuggestions[0] ?? null;
  const queued = activeSuggestions.slice(1);

  const latestArrival = events.length ? arrivedAt(events[events.length - 1]) : 0;
  const isSilent = player.isPlaying && player.elapsed - latestArrival >= FRESH_SECONDS;
  const status = player.isPlaying ? (isSilent ? 'No recent updates' : 'Listening') : null;
  const statusTone = isSilent ? 'quiet' : 'default';

  const isEmpty = !hero;

  const listRef = useRef<HTMLDivElement>(null);
  const heroId = hero?.event.id || null;

  // Auto-scroll to the top when a new active suggestion appears
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [heroId]);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <Frame>
      <Header>
        <h2 id="coach-heading">Live coaching</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {invalidCount > 0 && <InvalidBadge>Data gap</InvalidBadge>}
          {status && <StatusPill $tone={statusTone}>{status}</StatusPill>}
        </div>
      </Header>
      <CoachingBody
        ref={listRef}
        $centered={isEmpty}
        aria-live="polite"
        aria-relevant="additions text"
      >
        {hero ? (
          <>
            <HeroWrap>
              {renderSuggestion(hero, player.elapsed, () => handleDismiss(hero.event.id))}
            </HeroWrap>
            
            {queued.length > 0 && (
              <>
                <QueueHeader>
                  <span>Queue ({queued.length})</span>
                </QueueHeader>
                <QueueList>
                  {queued.map((item) =>
                    renderQueuedSuggestion(
                      item,
                      player.elapsed,
                      () => handleDismiss(item.event.id)
                    )
                  )}
                </QueueList>
              </>
            )}
          </>
        ) : (
          <PanelEmptyState
            icon="coaching"
            title="Guidance will appear here"
            subtitle="The co-pilot will surface only the moments that need your attention."
          />
        )}
      </CoachingBody>
    </Frame>
  );
});

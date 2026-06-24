import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useScenarioPlayer } from '../stores/RootStoreContext';
import type {
  CallPhase,
  PhaseChangeEvent,
  TalkRatioEvent,
  TranscriptEvent,
} from '../types/events';

const PHASE_LABELS: Record<CallPhase, string> = {
  intro: 'Introduction',
  discovery: 'Discovery',
  demo: 'Demo',
  objection: 'Objection',
  close: 'Close',
};

const PHASES = Object.keys(PHASE_LABELS) as CallPhase[];

const Surface = styled.div`
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 28px 0 40px;

  @media (max-width: 720px) {
    width: min(100% - 32px, 1180px);
    padding-top: 20px;
  }
`;

const ContextBar = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 32px;
  align-items: center;
  padding: 18px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 18px;
  }
`;

const SectionLabel = styled.p`
  margin: 0 0 7px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const PhaseHeading = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(20px, 3vw, 26px);
  line-height: 1.2;
`;

const PhaseSteps = styled.ol`
  display: flex;
  gap: 6px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
`;

const PhaseStep = styled.li<{ $active: boolean; $complete: boolean }>`
  width: 34px;
  height: 4px;
  border-radius: 999px;
  background: ${({ $active, $complete, theme }) =>
    $active || $complete ? theme.colors.accent : theme.colors.border};
  opacity: ${({ $active, $complete }) => ($active ? 1 : $complete ? 0.5 : 0.75)};
`;

const Ratio = styled.div`
  min-width: 230px;
`;

const RatioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 9px;
  font-size: 13px;

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-variant-numeric: tabular-nums;
  }
`;

const RatioTrack = styled.div`
  display: flex;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.border};
`;

const RepRatio = styled.div<{ $percent: number }>`
  width: ${({ $percent }) => `${$percent}%`};
  background: ${({ theme }) => theme.colors.accent};
  transition: width 180ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Workspace = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.75fr);
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  min-height: 360px;
  padding: 22px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h2 {
    margin: 0;
    font-size: 16px;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
  }
`;

const WaitingState = styled.div`
  display: grid;
  min-height: 270px;
  align-content: center;
  justify-items: start;
  max-width: 430px;

  h2 {
    margin: 0 0 8px;
    font-size: 20px;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.6;
  }
`;

const ListeningMark = styled.div`
  display: flex;
  gap: 5px;
  align-items: end;
  height: 24px;
  margin-bottom: 20px;

  span {
    width: 4px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.accent};
  }

  span:nth-child(1) {
    height: 10px;
  }

  span:nth-child(2) {
    height: 20px;
  }

  span:nth-child(3) {
    height: 14px;
  }
`;

const TranscriptList = styled.div`
  display: grid;
  gap: 18px;
  padding-top: 18px;
`;

const TranscriptLine = styled.article`
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  gap: 14px;

  strong {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    line-height: 1.6;
    text-transform: capitalize;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
    line-height: 1.6;
  }
`;

function isPhase(value: unknown): value is CallPhase {
  return typeof value === 'string' && PHASES.includes(value as CallPhase);
}

function isPhaseChangeEvent(event: unknown): event is PhaseChangeEvent {
  if (!event || typeof event !== 'object') return false;
  const candidate = event as Record<string, unknown>;
  return candidate.type === 'phase_change' && isPhase(candidate.phase);
}

function isTranscriptEvent(event: unknown): event is TranscriptEvent {
  if (!event || typeof event !== 'object') return false;
  const candidate = event as Record<string, unknown>;
  return (
    candidate.type === 'transcript' &&
    (candidate.speaker === 'rep' || candidate.speaker === 'buyer') &&
    typeof candidate.text === 'string' &&
    candidate.text.trim().length > 0
  );
}

function isTalkRatioEvent(event: unknown): event is TalkRatioEvent {
  if (!event || typeof event !== 'object') return false;
  const candidate = event as Record<string, unknown>;
  return (
    candidate.type === 'talk_ratio' &&
    typeof candidate.repPercent === 'number' &&
    typeof candidate.buyerPercent === 'number' &&
    Number.isFinite(candidate.repPercent) &&
    Number.isFinite(candidate.buyerPercent)
  );
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

export const CallSurface = observer(function CallSurface() {
  const player = useScenarioPlayer();
  const events = player.emittedEvents;

  const phaseEvent = [...events].reverse().find(isPhaseChangeEvent);
  const currentPhase = phaseEvent?.phase ?? null;

  const ratioEvent = [...events].reverse().find(isTalkRatioEvent);
  const repPercent = ratioEvent ? clampPercent(ratioEvent.repPercent) : null;
  const buyerPercent = ratioEvent ? clampPercent(ratioEvent.buyerPercent) : null;

  const transcripts = events.filter(isTranscriptEvent).slice(-4);
  const phaseIndex = currentPhase ? PHASES.indexOf(currentPhase) : -1;

  return (
    <Surface>
      <ContextBar aria-label="Current call context">
        <div>
          <SectionLabel>Call phase</SectionLabel>
          <PhaseHeading>
            {currentPhase ? PHASE_LABELS[currentPhase] : 'Waiting for the call to begin'}
          </PhaseHeading>
          <PhaseSteps aria-label={currentPhase ? `${PHASE_LABELS[currentPhase]} phase` : 'No phase detected'}>
            {PHASES.map((phase, index) => (
              <PhaseStep
                aria-hidden="true"
                key={phase}
                $active={phase === currentPhase}
                $complete={index < phaseIndex}
              />
            ))}
          </PhaseSteps>
        </div>

        <Ratio aria-label="Talk ratio">
          <SectionLabel>Talk ratio</SectionLabel>
          {repPercent === null || buyerPercent === null ? (
            <RatioHeader><span>Waiting for enough conversation</span></RatioHeader>
          ) : (
            <>
              <RatioHeader>
                <span>Rep <strong>{Math.round(repPercent)}%</strong></span>
                <span>Buyer <strong>{Math.round(buyerPercent)}%</strong></span>
              </RatioHeader>
              <RatioTrack aria-hidden="true">
                <RepRatio $percent={repPercent} />
              </RatioTrack>
            </>
          )}
        </Ratio>
      </ContextBar>

      <Workspace>
        <Panel aria-labelledby="coach-heading">
          <PanelHeader>
            <h2 id="coach-heading">Live coaching</h2>
            <span>{player.isPlaying ? 'Listening' : 'Paused'}</span>
          </PanelHeader>
          <WaitingState>
            <ListeningMark aria-hidden="true"><span /><span /><span /></ListeningMark>
            <h2>Guidance will appear here</h2>
            <p>
              The co-pilot is following the conversation and will surface only the moments that need your attention.
            </p>
          </WaitingState>
        </Panel>

        <Panel aria-labelledby="transcript-heading">
          <PanelHeader>
            <h2 id="transcript-heading">Recent conversation</h2>
            <span>{transcripts.length ? `${transcripts.length} recent` : 'No transcript yet'}</span>
          </PanelHeader>
          {transcripts.length ? (
            <TranscriptList aria-live="polite" aria-relevant="additions">
              {transcripts.map((event) => (
                <TranscriptLine key={event.id}>
                  <strong>{event.speaker}</strong>
                  <p>{event.text}</p>
                </TranscriptLine>
              ))}
            </TranscriptList>
          ) : (
            <WaitingState>
              <h2>Conversation context will collect here</h2>
              <p>Recent, valid transcript lines will stay visible without becoming a full call log.</p>
            </WaitingState>
          )}
        </Panel>
      </Workspace>
    </Surface>
  );
});

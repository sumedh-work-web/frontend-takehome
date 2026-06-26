import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { useScenarioPlayer } from "../stores/RootStoreContext";
import type { TalkRatioEvent, TranscriptEvent } from "../types/events";
import { LiveCoaching } from "./LiveCoaching";
import { PanelEmptyState } from "./PanelEmptyState";

const Surface = styled.div`
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  height: calc(100dvh - 72px - 92px);
  padding: 24px 0 0;
  overflow: hidden;
  min-height: 0;

  @media (max-width: 860px), (max-height: 600px) {
    width: min(100% - 32px, 1180px);
    height: auto;
    padding-top: 20px;
    overflow: visible;
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

const RatioTrackPlaceholder = styled(RatioTrack)`
  opacity: 0.55;
`;

const RatioHint = styled.p<{ $tone?: "default" | "warning" }>`
  margin: 10px 0 0;
  min-height: 17px;
  color: ${({ $tone, theme }) =>
    $tone === "warning" ? theme.colors.status.error.text : theme.colors.muted};
  font-size: 12px;
  font-weight: ${({ $tone }) => ($tone === "warning" ? 600 : 500)};
  line-height: 1.4;
`;

const EmptyRatioHeader = styled(RatioHeader)`
  color: ${({ theme }) => theme.colors.muted};

  strong {
    color: ${({ theme }) => theme.colors.muted};
    font-weight: 600;
  }
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
  height: 100%;
  min-height: 0;
  align-items: stretch;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    height: auto;
  }

  @media (max-height: 600px) {
    height: auto;
  }
`;

const RightRail = styled.div`
  display: grid;
  grid-template-rows: max-content minmax(240px, 1fr);
  gap: 20px;
  align-self: stretch;
  height: 100%;
  min-height: 0;

  @media (max-width: 860px) {
    grid-template-rows: none;
    height: auto;
  }
`;

const Panel = styled.section`
  min-height: 0;
  padding: 22px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;

  @media (max-width: 860px) {
    min-height: auto;
  }
`;

const CompactPanel = styled(Panel)`
  padding: 14px 16px;
`;

const CoachingPanel = styled(Panel)`
  align-self: stretch;
  height: 100%;
  min-height: 0;
  padding: 0; /* Move padding inside header and body to prevent scrolling clipping */

  @media (max-width: 860px), (max-height: 600px) {
    height: auto;
  }
`;

const RatioPanel = styled(CompactPanel)`
  align-self: start;
`;

const TranscriptPanel = styled(Panel)`
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  padding: 0; /* Move padding inside header and list to prevent scrolling clipping */

  @media (max-width: 860px), (max-height: 600px) {
    height: auto;
  }
`;

const PanelHeader = styled.div`
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
    font-size: 11px;
  }
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 15px;
`;

const TranscriptList = styled.div`
  display: grid;
  align-content: start;
  flex: 1;
  gap: 10px;
  padding: 14px 22px 28px 22px; /* Left, right, top and bottom padding inside the scroller */
  padding-right: 14px; /* Slightly less right padding so the scrollbar sits nicely */
  min-height: 0;
  overflow-y: auto;
  scroll-padding-bottom: 28px;
`;

const TranscriptLine = styled.article<{ $speaker: "rep" | "buyer"; $isGrouped: boolean }>`
  display: grid;
  justify-items: ${({ $speaker }) => ($speaker === "rep" ? "end" : "start")};
  gap: 4px;
  margin-top: ${({ $isGrouped }) => ($isGrouped ? "-6px" : "0")};
`;

const SpeakerMeta = styled.strong`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 10px;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const DelayedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.muted};
  font-size: 9px;
  font-weight: 700;
`;

const TranscriptBubble = styled.p<{ $speaker: "rep" | "buyer" }>`
  margin: 0;
  max-width: min(100%, 420px);
  padding: 9px 11px;
  border-radius: ${({ $speaker }) =>
    $speaker === "rep" ? "14px 0 14px 14px" : "0 14px 14px 14px"};
  background: ${({ $speaker, theme }) =>
    $speaker === "rep" ? theme.colors.accentLight : theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  line-height: 1.45;
`;

function isTranscriptEvent(event: unknown): event is TranscriptEvent {
  if (!event || typeof event !== "object") return false;
  const candidate = event as Record<string, unknown>;
  return (
    candidate.type === "transcript" &&
    (candidate.speaker === "rep" || candidate.speaker === "buyer") &&
    typeof candidate.text === "string" &&
    candidate.text.trim().length > 0
  );
}

function isTalkRatioEvent(event: unknown): event is TalkRatioEvent {
  if (!event || typeof event !== "object") return false;
  const candidate = event as Record<string, unknown>;
  return (
    candidate.type === "talk_ratio" &&
    typeof candidate.repPercent === "number" &&
    typeof candidate.buyerPercent === "number" &&
    Number.isFinite(candidate.repPercent) &&
    Number.isFinite(candidate.buyerPercent)
  );
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function arrivedAt(event: { t?: number; arrivalT?: number }) {
  if (typeof event.arrivalT === "number" && Number.isFinite(event.arrivalT))
    return event.arrivalT;
  return typeof event.t === "number" && Number.isFinite(event.t) ? event.t : 0;
}

export const CallSurface = observer(function CallSurface() {
  const player = useScenarioPlayer();
  const events = player.emittedEvents;
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the transcript to the bottom on new events
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events.length]);

  const ratioEvent = [...events].reverse().find(isTalkRatioEvent);
  const repPercent = ratioEvent ? clampPercent(ratioEvent.repPercent) : null;
  const buyerPercent = ratioEvent
    ? clampPercent(ratioEvent.buyerPercent)
    : null;
  const buyerName = player.scenario.buyer.name.split(" ")[0];

  const transcripts = events.filter(isTranscriptEvent);
  const ratioHint =
    repPercent === null
      ? ""
      : repPercent >= 65
        ? "Slow down! You're talking too much."
        : buyerPercent !== null && buyerPercent >= 55
          ? `Good space for ${buyerName} to talk.`
          : "Healthy balance so far.";

  return (
    <Surface>
      <Workspace>
        <CoachingPanel aria-labelledby="coach-heading">
          <LiveCoaching />
        </CoachingPanel>

        <RightRail>
          <RatioPanel aria-label="Talk ratio">
            <SectionLabel>Talk ratio</SectionLabel>
            {repPercent === null || buyerPercent === null ? (
              <>
                <EmptyRatioHeader>
                  <span>
                    You <strong>--</strong>
                  </span>
                  <span>
                    {buyerName} <strong>--</strong>
                  </span>
                </EmptyRatioHeader>
                <RatioTrackPlaceholder aria-hidden="true" />
                <RatioHint>Talk balance appears after a few exchanges.</RatioHint>
              </>
            ) : (
              <>
                <RatioHeader>
                  <span>
                    You <strong>{Math.round(repPercent)}%</strong>
                  </span>
                  <span>
                    {buyerName} <strong>{Math.round(buyerPercent)}%</strong>
                  </span>
                </RatioHeader>
                <RatioTrack aria-hidden="true">
                  <RepRatio $percent={repPercent} />
                </RatioTrack>
                <RatioHint
                  $tone={repPercent !== null && repPercent >= 65 ? "warning" : "default"}
                >
                  {ratioHint}
                </RatioHint>
              </>
            )}
          </RatioPanel>

          <TranscriptPanel aria-labelledby="transcript-heading">
            <PanelHeader>
              <PanelTitle id="transcript-heading">Call transcript</PanelTitle>
              <span>
                {transcripts.length
                  ? `${transcripts.length} recent lines`
                  : "No transcript yet"}
              </span>
            </PanelHeader>
            {transcripts.length ? (
              <TranscriptList
                ref={listRef}
                aria-live="polite"
                aria-relevant="additions"
              >
                {transcripts.map((event, index) => {
                  const prevEvent = index > 0 ? transcripts[index - 1] : null;
                  const isGrouped = prevEvent ? prevEvent.speaker === event.speaker : false;
                  return (
                    <TranscriptLine key={event.id} $speaker={event.speaker} $isGrouped={isGrouped}>
                      {!isGrouped && (
                        <SpeakerMeta>
                          {event.speaker === "rep" ? "You" : buyerName}
                          {arrivedAt(event) - event.t >= 5 && (
                            <DelayedBadge>Delayed</DelayedBadge>
                          )}
                        </SpeakerMeta>
                      )}
                      <TranscriptBubble $speaker={event.speaker}>
                        {event.text}
                      </TranscriptBubble>
                    </TranscriptLine>
                  );
                })}
              </TranscriptList>
            ) : (
              <PanelEmptyState
                icon="transcript"
                title="Transcript appears as the call starts"
                subtitle="Lines from the conversation will show here."
              />
            )}
          </TranscriptPanel>
        </RightRail>
      </Workspace>
    </Surface>
  );
});

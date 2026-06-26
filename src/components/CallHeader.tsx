import { Fragment } from 'react';
import { Avatar } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useScenarioPlayer } from '../stores/RootStoreContext';
import { formatClock } from '../utils/time';
import type { CallPhase } from '../types/events';

const PHASE_LABELS: Record<CallPhase, string> = {
  intro: 'Intro',
  discovery: 'Discovery',
  demo: 'Demo',
  objection: 'Objection',
  close: 'Close',
};

const PHASES = Object.keys(PHASE_LABELS) as CallPhase[];

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  height: 72px;
  padding: 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
`;

const PhaseRail = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  min-width: 0;

  @media (max-width: 860px) {
    display: none;
  }
`;

const PhasePill = styled.span<{ $active: boolean; $complete: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 82px;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${({ $active, $complete, theme }) => {
    if ($active) return theme.colors.accentLight;
    if ($complete) return theme.colors.accentUltraLight;
    return theme.colors.background;
  }};
  color: ${({ $active, $complete, theme }) => {
    if ($active) return theme.colors.accent;
    if ($complete) return theme.colors.text;
    return theme.colors.muted;
  }};
  font-size: 12px;
  font-weight: ${({ $active, $complete }) => ($active || $complete ? 600 : 500)};
  letter-spacing: 0.02em;
  box-shadow: ${({ $active, theme }) => ($active ? `inset 0 0 0 1px ${theme.colors.accent}` : 'none')};
  transition: all 180ms ease;
`;

const PhaseCheckIcon = styled(CheckOutlined)`
  margin-right: 6px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.accent};
`;

const Connector = styled.div<{ $complete: boolean }>`
  width: 14px;
  height: 2px;
  background: ${({ $complete, theme }) => ($complete ? theme.colors.accent : theme.colors.border)};
  transition: background 180ms ease;
  flex-shrink: 0;
`;

const CompactPhase = styled.div`
  display: none;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accentLight};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.accent};

  @media (max-width: 860px) {
    display: inline-flex;
  }
`;

const Buyer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  div {
    min-width: 0;
  }

  strong {
    font-size: 16px;
    color: ${({ theme }) => theme.colors.text};
  }

  span {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const Timer = styled.div`
  font-variant-numeric: tabular-nums;
  font-size: 18px;
  font-weight: 600;
`;

export const CallHeader = observer(function CallHeader() {
  const player = useScenarioPlayer();
  const { buyer } = player.scenario;
  const currentPhase = [...player.emittedEvents].reverse().find(
    (event): event is { type: 'phase_change'; phase: CallPhase } =>
      event.type === 'phase_change' &&
      typeof event.phase === 'string' &&
      event.phase in PHASE_LABELS,
  );
  const activePhase = currentPhase?.phase ?? null;
  const phaseIndex = activePhase ? PHASES.indexOf(activePhase) : -1;

  return (
    <Header>
      <Buyer>
        <Avatar size={40}>{buyer.name.charAt(0)}</Avatar>
        <div>
          <strong>{buyer.name}</strong>
          <span>{buyer.company}</span>
        </div>
      </Buyer>
      <PhaseRail aria-label="Call phases">
        {PHASES.map((phase, index) => (
          <Fragment key={phase}>
            {index > 0 && <Connector $complete={index <= phaseIndex} />}
            <PhasePill
              $active={phase === activePhase}
              $complete={index < phaseIndex}
              aria-current={phase === activePhase ? 'step' : undefined}
            >
              {index < phaseIndex && (
                <PhaseCheckIcon />
              )}
              {PHASE_LABELS[phase]}
            </PhasePill>
          </Fragment>
        ))}
      </PhaseRail>
      {activePhase && (
        <CompactPhase>
          {PHASE_LABELS[activePhase]} ({phaseIndex + 1}/{PHASES.length})
        </CompactPhase>
      )}
      <Timer>{formatClock(player.elapsed)}</Timer>
    </Header>
  );
});

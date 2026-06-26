import { useState } from 'react';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  ThunderboltFilled,
  HistoryOutlined,
  DownOutlined,
  UpOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import type { BattleCardSuggestionEvent } from '../types/events';

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

const DecayBar = styled.div<{ $percent: number; $stale?: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 4px;
  width: ${({ $percent }) => `${$percent * 100}%`};
  background: ${({ $stale, theme }) => ($stale ? theme.colors.slate[400] : theme.colors.accent)};
  opacity: 0.85;
  transition: width 150ms linear;
`;

interface BattleCardProps {
  event: BattleCardSuggestionEvent;
  delayed?: boolean;
  stale?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  onDismiss?: () => void;
  decayPercent?: number;
}

const Card = styled.article<{ $stale?: boolean }>`
  position: relative;
  overflow: hidden;
  padding: 20px 18px 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  background: ${({ theme }) => theme.colors.surface};
  opacity: ${({ $stale }) => ($stale ? 0.9 : 1)};
  transition: all 180ms ease;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const BoltMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accentLight};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 12px;
  line-height: 1;
  flex-shrink: 0;
`;

const StaleReference = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 0;
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.slate[50]};
  cursor: pointer;
  transition: all 180ms ease;

  strong {
    color: ${({ theme }) => theme.colors.slate[600]};
    font-size: 13px;
  }

  span {
    font-size: 11px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.slate[100]};
    border-color: ${({ theme }) => theme.colors.accent};
    strong {
      color: ${({ theme }) => theme.colors.accent};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
`;

const StaleLeft = styled.div`
  display: flex;
  align-items: center;
`;

const StaleRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StaleBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.slate[100]};
  border: 1px solid ${({ theme }) => theme.colors.slate[200]};
  border-radius: 0;
  color: ${({ theme }) => theme.colors.slate[500]};
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 12px;
  cursor: pointer;
  user-select: none;
  transition: all 180ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.slate[200]};
    color: ${({ theme }) => theme.colors.slate[600]};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
  }
`;

const StaleBannerLeft = styled.div`
  display: flex;
  align-items: center;
`;

const Eyebrow = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Badge = styled.span<{ $tone?: 'muted' | 'accent' }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border-radius: 999px;
  background: ${({ $tone, theme }) =>
    $tone === 'muted' ? theme.colors.background : theme.colors.accentLight};
  color: ${({ $tone, theme }) =>
    $tone === 'muted' ? theme.colors.muted : theme.colors.accent};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Title = styled.h3`
  margin: 0 0 2px;
  font-size: 17px;
  line-height: 1.2;
`;

const BulletList = styled.ul`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  line-height: 1.4;

  li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .anticon {
    margin-top: 2px;
    flex-shrink: 0;
    font-size: 15px;
  }
`;

const PrimarySection = styled.section`
  margin-top: 10px;
`;

const SectionLabel = styled.h4`
  margin: 0 0 6px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Divider = styled.div`
  height: 1px;
  margin: 14px 0 0;
  background: ${({ theme }) => theme.colors.border};
`;

const DetailStack = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 12px;
`;

const DetailSection = styled.section``;

const Proof = styled.blockquote`
  margin: 0;
  padding: 12px 14px;
  border-left: 4px solid ${({ theme }) => theme.colors.accent};
  border-radius: 0 10px 10px 0;
  background: ${({ theme }) => theme.colors.accentUltraLight};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-style: italic;
  line-height: 1.45;
`;

const StaleHistoryIcon = styled(HistoryOutlined)`
  margin-right: 8px;
  color: ${({ theme }) => theme.colors.slate[500]};
  font-size: 14px;
`;

const StaleDownIcon = styled(DownOutlined)`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.slate[500]};
`;

const BannerHistoryIcon = styled(HistoryOutlined)`
  margin-right: 6px;
  font-size: 13px;
`;

const WinCheckIcon = styled(CheckCircleOutlined)`
  color: ${({ theme }) => theme.colors.accent};
`;

const ObjectionMsgIcon = styled(MessageOutlined)`
  color: ${({ theme }) => theme.colors.status.warning.icon};
`;

const CloseIcon = styled(CloseCircleOutlined)`
  color: ${({ theme }) => theme.colors.status.error.icon};
`;

export function BattleCard({
  event,
  delayed = false,
  stale = false,
  isExpanded = false,
  onToggleExpand,
  onDismiss,
  decayPercent,
}: BattleCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const setExpanded = onToggleExpand ? onToggleExpand : setLocalExpanded;

  if (stale && !expanded) {
    return (
      <StaleReference
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(true);
          }
        }}
        aria-expanded={false}
        aria-label={`Stale ${event.competitor} battle card reference. Click to expand.`}
      >
        <StaleLeft>
          <StaleHistoryIcon aria-hidden="true" />
          <strong>{event.competitor} reference</strong>
        </StaleLeft>
        <StaleRight>
          <span>Reference may be out of date</span>
          <StaleDownIcon aria-hidden="true" />
        </StaleRight>
      </StaleReference>
    );
  }

  const extraDifferentiators = event.differentiators.slice(2);
  const hasDetails =
    extraDifferentiators.length > 0 ||
    event.commonObjections.length > 0 ||
    event.whatNotToSay.length > 0 ||
    Boolean(event.customerProofQuote);

  return (
    <Card $stale={stale}>
      {stale && (
        <StaleBanner
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded(false);
            }
          }}
          aria-expanded={true}
          aria-label="Stale battle card reference warning. Click to collapse."
        >
          <StaleBannerLeft>
            <BannerHistoryIcon aria-hidden="true" />
            <span>Stale reference (surfaced 30s+ ago)</span>
          </StaleBannerLeft>
          <UpOutlined style={{ fontSize: 10 }} />
        </StaleBanner>
      )}
      <HeaderRow>
        <HeaderTitle>
          <BoltMark aria-hidden="true">
            <ThunderboltFilled />
          </BoltMark>
          <Eyebrow>Battle card</Eyebrow>
        </HeaderTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BadgeRow>
            <Badge>Reference surfaced</Badge>
            {delayed && <Badge $tone="muted">Delayed arrival</Badge>}
          </BadgeRow>
          {onDismiss && (
            <DismissButton aria-label="Dismiss battle card" onClick={onDismiss}>
              <CloseOutlined />
            </DismissButton>
          )}
        </div>
      </HeaderRow>
      <Title>{event.competitor} just came up</Title>
      <PrimarySection>
        <SectionLabel>Why we win</SectionLabel>
        <BulletList style={{ marginTop: '10px' }}>
          {event.differentiators.slice(0, 2).map((item) => (
            <li key={item}>
              <WinCheckIcon aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </BulletList>
      </PrimarySection>

      {hasDetails && (
        <>
          <Divider />
          <DetailStack>
            {extraDifferentiators.length > 0 && (
              <DetailSection>
                <SectionLabel>More positioning</SectionLabel>
                <BulletList>
                  {extraDifferentiators.map((item) => (
                    <li key={item}>
                      <WinCheckIcon aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </BulletList>
              </DetailSection>
            )}
            {event.commonObjections.length > 0 && (
              <DetailSection>
                <SectionLabel>Expect to hear</SectionLabel>
                <BulletList>
                  {event.commonObjections.map((item) => (
                    <li key={item}>
                      <ObjectionMsgIcon aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </BulletList>
              </DetailSection>
            )}
            {event.whatNotToSay.length > 0 && (
              <DetailSection>
                <SectionLabel>Don&apos;t say</SectionLabel>
                <BulletList>
                  {event.whatNotToSay.map((item) => (
                    <li key={item}>
                      <CloseIcon aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </BulletList>
              </DetailSection>
            )}
            {event.customerProofQuote && <Proof>“{event.customerProofQuote}”</Proof>}
          </DetailStack>
        </>
      )}
      {decayPercent !== undefined && (
        <DecayBar $percent={decayPercent} $stale={stale} />
      )}
    </Card>
  );
}

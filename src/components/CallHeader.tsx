import { Avatar } from 'antd';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useScenarioPlayer } from '../stores/RootStoreContext';
import { formatClock } from '../utils/time';

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
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

  return (
    <Header>
      <Buyer>
        <Avatar size={40}>{buyer.name.charAt(0)}</Avatar>
        <div>
          <strong>{buyer.name}</strong>
          <span>{buyer.company}</span>
        </div>
      </Buyer>
      <Timer>{formatClock(player.elapsed)}</Timer>
    </Header>
  );
});

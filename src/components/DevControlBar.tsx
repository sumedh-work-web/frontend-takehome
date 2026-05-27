import { PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Select, Slider, Space, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import type { ScenarioId } from '../lib/scenarioPlayer';
import { useScenarioPlayer } from '../stores/RootStoreContext';
import { formatClock } from '../utils/time';

const Bar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: auto minmax(180px, 1fr) auto;
  gap: 16px;
  align-items: center;
  min-height: 68px;
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const Time = styled(Typography.Text)`
  min-width: 86px;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

export const DevControlBar = observer(function DevControlBar() {
  const player = useScenarioPlayer();

  return (
    <Bar>
      <Space wrap>
        <Button
          aria-label={player.isPlaying ? 'Pause scenario' : 'Play scenario'}
          icon={player.isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={player.isPlaying ? player.pause : player.play}
          type="primary"
        >
          {player.isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Select
          aria-label="Scenario"
          value={player.scenarioId}
          onChange={(value) => player.selectScenario(value as ScenarioId)}
          style={{ width: 180 }}
        >
          {player.scenarios.map((scenario) => (
            <Select.Option key={scenario.id} value={scenario.id}>
              {scenario.label}
            </Select.Option>
          ))}
        </Select>
      </Space>

      <Slider
        min={0}
        max={player.duration}
        step={0.5}
        tooltip={{ open: false }}
        value={player.elapsed}
        onChange={(value) => player.scrub(Number(value))}
      />

      <Time>
        {formatClock(player.elapsed)} / {formatClock(player.duration)}
      </Time>
    </Bar>
  );
});

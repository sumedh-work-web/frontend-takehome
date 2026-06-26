import styled from 'styled-components';
import { BulbOutlined, FileTextOutlined } from '@ant-design/icons';

interface PanelEmptyStateProps {
  icon: 'coaching' | 'transcript';
  title: string;
  subtitle: string;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 6px;
  max-width: 440px;
  margin: 0 auto;
  text-align: center;
  padding: 12px 20px;
`;

const Mark = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.accentUltraLight};
  border: 1px solid ${({ theme }) => theme.colors.accentLight};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 22px;
  margin-bottom: 4px;
  flex-shrink: 0;
`;

const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  line-height: 1.6;
`;

export function PanelEmptyState({ icon, title, subtitle }: PanelEmptyStateProps) {
  return (
    <Wrap>
      <Mark aria-hidden="true">
        {icon === 'coaching' ? <BulbOutlined /> : <FileTextOutlined />}
      </Mark>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Wrap>
  );
}


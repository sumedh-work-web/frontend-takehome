import styled from 'styled-components';
import { CallHeader } from './components/CallHeader';
import { CallSurface } from './components/CallSurface';
import { DevControlBar } from './components/DevControlBar';

const Shell = styled.main`
  height: 100dvh;
  padding-bottom: 92px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};

  @media (max-width: 860px), (max-height: 600px) {
    height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 120px;
  }

  @media (max-width: 720px) {
    padding-bottom: 180px;
  }
`;

export default function App() {
  return (
    <>
      <Shell>
        <CallHeader />
        <CallSurface />
      </Shell>
      <DevControlBar />
    </>
  );
}

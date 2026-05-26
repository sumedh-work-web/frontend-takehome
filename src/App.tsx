import styled from 'styled-components';
import { CallHeader } from './components/CallHeader';
import { DevControlBar } from './components/DevControlBar';

const Shell = styled.main`
  min-height: 100vh;
  padding-bottom: 84px;
  background: ${({ theme }) => theme.colors.background};
`;

export default function App() {
  return (
    <>
      <Shell>
        <CallHeader />
      </Shell>
      <DevControlBar />
    </>
  );
}

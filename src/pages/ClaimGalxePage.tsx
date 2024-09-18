// External Packages
import ReactGA from 'react-ga';
import styled from 'styled-components';

// Internal Components
import { SectionV2 } from 'components/reusables/SharedStylingV2';
import ClaimGalxeModule from 'modules/claimGalxe/ClaimGalxeModule';

// Internal Configs
import GLOBALS from 'config/Globals';

// Other Information section
const ClaimGalxePage = () => {
  // React GA Analytics
  ReactGA.pageview('/airdrop');

  // RENDER
  return (
    <Container>
      <ClaimGalxeModule />
    </Container>
  );
};
export default ClaimGalxePage;

// This defines the page settings, toggle align-self to center if not covering entire stuff, align-items to place them at center, justify content flex start to start from top
const Container = styled(SectionV2)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - ${GLOBALS.CONSTANTS.HEADER_HEIGHT}px - 52px - ${(props) => props.theme.interfaceTopPadding});
  justify-content: flex-start;
`;

// React + Web3 Essentials
import React from 'react';

// External Packages
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

// Internal Compoonents
import PushLogoDark from 'assets/pushDark.svg?react';
import PushLogoLight from 'assets/pushLight.svg?react';
import HandTap from 'assets/snap/HandTap.svg?react';
import NotificationLogo from 'assets/snap/Notification.svg?react';
import WalletLogo from 'assets/snap/Wallet.svg?react';
import Metamask from 'assets/snap/metamasksnap.svg?react';
import { ItemHV2, ItemVV2, SpanV2 } from 'components/reusables/SharedStylingV2';
import { Button } from 'blocks';

const SnapInformationModal = ({ handleCloseModal }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const defaultSnapOrigin = 'npm:@pushprotocol/snap';

  const connectSnap = async (snapId = defaultSnapOrigin, params = {}) => {
    await window.ethereum?.request({
      method: 'wallet_requestSnaps',
      params: {
        [snapId]: params,
      },
    });
  };

  const installSnap = async () => {
    handleCloseModal();
    navigate('/snap');

    // await connectSnap();
    // const res = await window.ethereum?.request({
    //   method: 'wallet_invokeSnap',
    //   params: {
    //     snapId: defaultSnapOrigin,
    //     request: { method: 'pushproto_welcome' },
    //   },
    // });

    // if (res) {
    //     window.open("/snap", '_self');
    // }
  };

  return (
    <Container>
      <ItemHV2 margin="0 0 23px 0">
        {theme.scheme == 'light' ? (
          <PushLogoLight
            height="37"
            width="95px"
          />
        ) : (
          <PushLogoDark
            height="37"
            width="95px"
          />
        )}
      </ItemHV2>

      <SpanV2
        fontSize="22px"
        fontWeight="500"
        letterSpacing="normal"
        color={theme.snapPrimaryText}
      >
        Connect to Metamask Push Snap
      </SpanV2>

      <ItemVV2
        gap="24px"
        margin="32px 0"
      >
        <ItemHV2 alignItems="baseline">
          <NotificationLogo />
          <ItemVV2 margin="0 0 0 16px">
            <PrimaryText>Notifications</PrimaryText>
            <SecondaryText>Get notified by your favourite channels using Push Snap.</SecondaryText>
          </ItemVV2>
        </ItemHV2>

        <ItemHV2 alignItems="baseline">
          <WalletLogo />
          <ItemVV2 margin="0 0 0 16px">
            <PrimaryText>Address Selection</PrimaryText>
            <SecondaryText>Add or remove your wallet preferred wallet addresses for notifications.</SecondaryText>
          </ItemVV2>
        </ItemHV2>

        <ItemHV2 alignItems="baseline">
          <HandTap />
          <ItemVV2 margin="0 0 0 16px">
            <PrimaryText>Customize Notification Pop-ups</PrimaryText>
            <SecondaryText>Snooze popup notifications as per your convenience.</SecondaryText>
          </ItemVV2>
        </ItemHV2>
      </ItemVV2>

      <ItemVV2>
        <Button
          onClick={() => installSnap()}
          variant="primary"
          leadingIcon={<Metamask />}
          size="large"
        >
          Install Snap
        </Button>
      </ItemVV2>
    </Container>
  );
};

export default SnapInformationModal;

const Container = styled(ItemVV2)`
  padding: 0px 9px 12px 9px;
`;

const PrimaryText = styled.p`
  margin: 0px;
  font-size: 18px;
  font-weight: 500;
  align-self: baseline;
  color: ${(props) => props.theme.snapPrimaryText};
`;

const SecondaryText = styled.p`
  margin: 0px;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: ${(props) => props.theme.snapSecondaryText};
  text-align: left;
`;

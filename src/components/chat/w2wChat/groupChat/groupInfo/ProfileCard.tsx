// React + Web3 Essentials
import { useState } from 'react';

// External Packages
import styled, { useTheme } from 'styled-components';

// Internal Components
import MoreDark from 'assets/chat/group-chat/moredark.svg?react';
import MoreLight from 'assets/chat/group-chat/more.svg?react';
import { ImageV2, ItemHV2, ItemVV2, SpanV2 } from 'components/reusables/SharedStylingV2';
import { shortenText } from 'helpers/UtilityHelper';
import Dropdown from 'components/Dropdown';
import { caip10ToWallet } from '../../../../../helpers/w2w';
import { device } from 'config/Globals';
import { useAccount } from 'hooks';

export const ProfileCard = ({
  key,
  member,
  dropdownValues,
  selectedMemeberAddress,
  setSelectedMemeberAddress,
  dropdownRef,
}) => {
  const theme = useTheme();
  const { account } = useAccount();

  const [dropdownHeight, setDropdownHeight] = useState(0);

  const handleHeight = (id) => {
    const containerHeight = document.getElementById(id)?.getBoundingClientRect();
    console.info('height', containerHeight);
    setDropdownHeight(containerHeight?.top);
  };

  return (
    <ProfileCardItem
      background={member.wallet === selectedMemeberAddress ? theme.chat.snapFocusBg : ''}
      id={member.wallet}
      key={key}
    >
      <ItemHV2 justifyContent="flex-start">
        <ItemVV2
          height="48px"
          maxWidth="48px"
          borderRadius="100%"
          overflow="hidden"
          margin="0px 12px 0px 0px"
        >
          <ImageV2
            maxHeight="100%"
            objectFit="cover"
            src={member?.image}
          />
        </ItemVV2>
        <SpanV2
          fontSize="18px"
          fontWeight="400"
          color={theme.modalProfileTextColor}
        >
          {shortenText(member?.wallet?.split(':')[1], 6)}
        </SpanV2>
      </ItemHV2>
      <ItemHV2 justifyContent="flex-end">
        {member?.isAdmin && (
          <SpanV2
            background="#F4DCEA"
            color="#D53A94"
            borderRadius="8px"
            padding="6px"
            fontWeight="500"
            fontSize="10px"
          >
            Admin
          </SpanV2>
        )}
        {caip10ToWallet(member?.wallet)?.toLowerCase() !== account?.toLowerCase() && dropdownValues.length > 0 && (
          <ItemVV2
            maxWidth="4px"
            padding="0 20px 0 0"
            onClick={() => {
              handleHeight(member.wallet);
              setSelectedMemeberAddress(member?.wallet);
            }}
            style={{ cursor: 'pointer' }}
          >
            {theme.scheme == 'light' ? <MoreLight /> : <MoreDark />}
          </ItemVV2>
        )}
      </ItemHV2>
      {selectedMemeberAddress?.toLowerCase() == member?.wallet?.toLowerCase() && (
        <DropdownContainer
          style={{ top: dropdownHeight > 570 ? '-70%' : '70%' }}
          ref={dropdownRef}
        >
          <Dropdown
            dropdownValues={dropdownValues}
            hoverBGColor={theme.chat.snapFocusBg}
          />
        </DropdownContainer>
      )}
    </ProfileCardItem>
  );
};

const ProfileCardItem = styled(ItemHV2)`
  justify-content: space-between;
  padding: 8px 16px;
  border-radius: 16px;
  position: relative;
  box-sizing: border-box;
  // background-color: ${(props) => props.theme.chat.snapFocusBg};
  margin-bottom: 8px;
  max-height: 64px;
  @media (max-width: 480px) {
    max-width: 300px;
  }
`;

const DropdownContainer = styled(ItemVV2)`
  position: absolute;
  // left: 85.5%;
  left: 48%;
  top: 69%;
  border-radius: 16px;
  padding: 14px 8px;
  background: ${(props) => props.theme.modalContentBackground};
  border: 1px solid ${(props) => props.theme.modalBorderColor};
  z-index: 11;
  @media ${device.mobileL} {
    left: 27%;
  }
  @media (min-width: 426px) and (max-width: 1150px) {
    left: 48%;
  }
  @media (max-width: 480px) {
    left: 25%;
  }
`;

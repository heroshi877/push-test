// React + Web3 Essentials
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

// External Packages
import { MdError } from 'react-icons/md';
import styled, { ThemeProvider, useTheme } from 'styled-components';

// Internal Components
import { user as pushUser } from '@pushprotocol/restapi';
import AddDark from 'assets/chat/group-chat/adddark.svg?react';
import AddLight from 'assets/chat/group-chat/addlight.svg?react';
import Clear from 'assets/chat/group-chat/close.svg?react';
import MoreLight from 'assets/chat/group-chat/more.svg?react';
import MoreDark from 'assets/chat/group-chat/moredark.svg?react';
import SearchIcon from 'assets/chat/search.svg?react';
import LoaderSpinner, { LOADER_TYPE } from 'components/reusables/loaders/LoaderSpinner';
import { ItemHV2, ItemVV2, SpanV2 } from 'components/reusables/SharedStylingV2';
import * as w2wChatHelper from 'helpers/w2w';
import { displayDefaultUser } from 'helpers/w2w/user';
import useToast from 'hooks/useToast';
import ModalConfirmButton from 'primaries/SharedModalComponents/ModalConfirmButton';

// Internal configs
import { appConfig } from 'config/index.js';
import { device } from 'config/Globals';
import { addWalletValidation } from 'helpers/w2w/groupChat';
import { User } from '../../../../../types/chat';
import GroupModalHeader from './GroupModalHeader';
import MemberListContainer from './MemberListContainer';
import { useAccount } from 'hooks';

export const AddWalletContent = ({
  onSubmit,
  memberList,
  handleMemberList,
  isLoading,
  handlePrevious,
  handleClose,
  title,
  groupMembers,
}) => {
  const [searchedUser, setSearchedUser] = useState<string>('');
  const { account } = useAccount();
  const [filteredUserData, setFilteredUserData] = useState<any>(null);
  const [isInValidAddress, setIsInvalidAddress] = useState<boolean>(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const provider = new ethers.providers.InfuraProvider(appConfig.coreContractChain, appConfig.infuraAPIKey);

  const theme = useTheme();
  const searchFeedToast = useToast();

  useEffect(() => {
    if (isInValidAddress) {
      searchFeedToast.showMessageToast({
        toastTitle: 'Error',
        toastMessage: 'Invalid Address',
        toastType: 'ERROR',
        getToastIcon: (size) => (
          <MdError
            size={size}
            color="red"
          />
        ),
      });
    }
  }, [isInValidAddress]);

  const onChangeSearchBox = (e) => {
    setSearchedUser(e.target.value);
  };

  const handleSearch = async (e): Promise<void> => {
    setIsLoadingSearch(true);
    setIsInvalidAddress(false);
    e.preventDefault();
    if (!ethers.utils.isAddress(searchedUser)) {
      let address: string;
      try {
        address = await provider.resolveName(searchedUser);
        // if (!address) {
        //   address = await library.resolveName(searchedUser);
        // }
        // this ensures address are checksummed
        address = ethers.utils.getAddress(address?.toLowerCase());
        if (address) {
          handleUserSearch(address);
        } else {
          setIsInvalidAddress(true);
          setFilteredUserData(null);
        }
      } catch (err) {
        setIsInvalidAddress(true);
        setFilteredUserData(null);
      } finally {
        setIsLoadingSearch(false);
      }
    } else {
      handleUserSearch(searchedUser);
    }
  };

  const handleUserSearch = async (userSearchData: string): Promise<void> => {
    try {
      const caip10 = w2wChatHelper.walletToCAIP10({ account: userSearchData });
      let filteredData: User;

      if (userSearchData.length) {
        filteredData = await pushUser.get({
          account: caip10,
          env: appConfig.appEnv,
        });

        if (filteredData !== null) {
          setFilteredUserData(filteredData);
        }
        // User is not in the protocol. Create new user
        else {
          if (ethers.utils.isAddress(userSearchData)) {
            const displayUser = displayDefaultUser({ caip10 });
            setFilteredUserData(displayUser);
          } else {
            setIsInvalidAddress(true);
            setFilteredUserData(null);
          }
        }
      } else {
        setFilteredUserData(null);
      }
      setIsLoadingSearch(false);
    } catch (error) {
      searchFeedToast.showMessageToast({
        toastTitle: 'Error',
        toastMessage: 'Unsuccesful search, Try again',
        toastType: 'ERROR',
        getToastIcon: (size) => (
          <MdError
            size={size}
            color="red"
          />
        ),
      });
      setIsLoadingSearch(false);
    }
  };

  const clearInput = () => {
    setSearchedUser('');
    setFilteredUserData(null);
    setIsLoadingSearch(false);
  };

  const addMemberToList = (member: User) => {
    let errorMessage = '';

    errorMessage = addWalletValidation(member, memberList, groupMembers, account);

    if (errorMessage) {
      searchFeedToast.showMessageToast({
        toastTitle: 'Error',
        toastMessage: `${errorMessage}`,
        toastType: 'ERROR',
        getToastIcon: (size) => (
          <MdError
            size={size}
            color="red"
          />
        ),
      });
    } else {
      handleMemberList((prev) => [...prev, { ...member, isAdmin: false }]);
    }

    setFilteredUserData('');
    clearInput();
  };

  const removeMemberFromList = (member: User) => {
    const filteredMembers = memberList.filter((user) => user.wallets !== member.wallets);
    handleMemberList(filteredMembers);
  };

  return (
    <ThemeProvider theme={theme}>
      <GroupModalHeader
        handlePrevious={handlePrevious}
        handleClose={handleClose}
        title={title}
      />

      <Container>
        <SearchbarContainer>
          <LabelContainer>
            <SpanV2
              color={theme.modalHeadingColor}
              fontWeight={500}
              fontSize="18px"
            >
              Add Wallets
            </SpanV2>
            <SpanV2
              color={theme.modalSecondaryTextColor}
              fontWeight={400}
              fontSize="14px"
            >
              {groupMembers
                ? `0${memberList?.length + groupMembers?.length} / 5000 Members`
                : `0${memberList?.length} / 5000 Members`}
            </SpanV2>
          </LabelContainer>
          <SearchBarContent onSubmit={handleSearch}>
            <Input
              type="text"
              value={searchedUser}
              onChange={onChangeSearchBox}
              placeholder="Search Web3 domain or 0x123..."
              color={theme.modalPrimaryTextColor}
            />
            <ItemVV2
              position="absolute"
              alignItems="flex-end"
              width="40px"
              height="24px"
              top="22px"
              right="16px"
            >
              {searchedUser.length > 0 && (
                <Clear
                  onClick={clearInput}
                  style={{ cursor: 'pointer' }}
                />
              )}
              {searchedUser.length == 0 && !filteredUserData && <SearchIcon style={{ cursor: 'pointer' }} />}
            </ItemVV2>
          </SearchBarContent>
        </SearchbarContainer>
        {filteredUserData ? (
          <MemberList>
            <MemberListContainer
              memberData={filteredUserData}
              handleMemberList={addMemberToList}
              lightIcon={<AddLight />}
              darkIcon={<AddDark />}
            />
          </MemberList>
        ) : isLoadingSearch ? (
          <ItemHV2 margin="0px 0px 34px 0px">
            <LoaderSpinner
              type={LOADER_TYPE.SEAMLESS}
              width="auto"
              spinnerSize={40}
            />
          </ItemHV2>
        ) : null}

        <MultipleMemberList>
          {memberList.map((member, index) => (
            <MemberListContainer
              key={index}
              memberList={memberList}
              memberData={member}
              handleMembers={handleMemberList}
              handleMemberList={removeMemberFromList}
              lightIcon={<MoreLight />}
              darkIcon={<MoreDark />}
            />
          ))}
        </MultipleMemberList>

        <ModalConfirmButton
          text={groupMembers ? 'Add To Group' : 'Create Group'}
          onClick={() => onSubmit()}
          isLoading={isLoading}
          loaderTitle={groupMembers ? 'Adding Members' : 'Creating group'}
          backgroundColor={memberList?.length > 0 ? '#CF1C84' : theme.groupButtonBackgroundColor}
          color={memberList?.length > 0 ? '#FFF' : theme.groupButtonTextColor}
          border={memberList?.length > 0 ? 'none' : `1px solid ${theme.modalConfirmButtonBorder}`}
          topMargin="60px"
        />
      </Container>
    </ThemeProvider>
  );
};

const Container = styled.div`
  margin-top: 62px;
`;

const SearchbarContainer = styled(ItemVV2)`
  margin-bottom: 8px;
`;

const LabelContainer = styled(ItemHV2)`
  min-width: 445px;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 6px;
  @media ${device.mobileL} {
    min-width: 300px;
  }
`;

const SearchBarContent = styled.form`
  position: relative;
  display: flex;
  flex: 1;
`;

const Input = styled.input`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-width: 445px;
  height: 48px;
  padding: 0px 50px 0px 16px;
  margin: 10px 0px 0px;
  border-radius: 99px;
  border: 1px solid;
  border-color: ${(props) => props.theme.modalSearchBarBorderColor};
  background: ${(props) => props.theme.modalSearchBarBackground};
  color: ${(props) => props.color || '#000'};
  &:focus {
    outline: none;
    background-image: linear-gradient(
        ${(props) => props.theme.chat.snapFocusBg},
        ${(props) => props.theme.chat.snapFocusBg}
      ),
      linear-gradient(
        to right,
        rgba(182, 160, 245, 1),
        rgba(244, 110, 246, 1),
        rgba(255, 222, 211, 1),
        rgba(255, 207, 197, 1)
      );
    background-origin: border;
    border: 1px solid transparent !important;
    background-clip: padding-box, border-box;
  }
  &::placeholder {
    color: #657795;
  }
  @media ${device.mobileL} {
    min-width: 300px;
  }
`;

const MemberList = styled(ItemVV2)`
  justify-content: 'flex-start';
  padding: 0px 2px;
  margin: 0 0 34px 0;
`;

const MultipleMemberList = styled.div`
  overflow-y: auto;
  height: fit-content;
  max-height: 216px;
  padding: 0px 2px;
  overflow-x: hidden;

  &::-webkit-scrollbar-track {
    background-color: ${(props) => props.theme.scrollBg};
  }

  &::-webkit-scrollbar {
    background-color: ${(props) => props.theme.scrollBg};
    width: 6px;
  }

  @media (max-width: 768px) {
    padding: 0px 0px 0px 0px;
    max-height: 35vh;

    &::-webkit-scrollbar-track {
      background-color: none;
      border-radius: 9px;
    }

    &::-webkit-scrollbar {
      background-color: none;
      width: 4px;
    }
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-image: -webkit-gradient(
      linear,
      left top,
      left bottom,
      color-stop(0.44, #cf1c84),
      color-stop(0.72, #cf1c84),
      color-stop(0.86, #cf1c84)
    );
  }
`;

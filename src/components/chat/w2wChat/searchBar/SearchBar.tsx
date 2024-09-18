// React + Web3 Essentials

import { useContext, useEffect, ChangeEvent, useState } from 'react';

// External Packages
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@mui/icons-material/Add';
import styled, { useTheme } from 'styled-components';

// Internal Components
import SearchIcon from 'assets/chat/search.svg?react';
import { ImageV2, ItemHV2, ItemVV2, SpanV2 } from 'components/reusables/SharedStylingV2';
import LoaderSpinner, { LOADER_TYPE } from 'components/reusables/loaders/LoaderSpinner';
import { Context } from 'modules/chat/ChatModule';
import { AppContext } from 'types/chat';
import ArrowLeft from '../../../../assets/chat/arrowleft.svg';
import { Box, Button } from 'blocks';

interface InputProps {
  typed: boolean;
}

const SearchBar = ({ autofilled, searchedUser, setSearchedUser }) => {
  // get theme
  const theme = useTheme();

  const { setHasUserBeenSearched, activeTab, setActiveTab, userShouldBeSearched, setUserShouldBeSearched }: AppContext =
    useContext<AppContext>(Context);

  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);

  useEffect(() => {
    if (searchedUser !== '' && userShouldBeSearched) {
      setSearchedUser(searchedUser);
      setUserShouldBeSearched(false);
    }
    return () => setUserShouldBeSearched(false);
  }, []);

  useEffect(() => {
    if (autofilled && !userShouldBeSearched) {
      if (autofilled.includes('chatid')) {
        setSearchedUser(autofilled.split(':')[1]);
      } else {
        setSearchedUser(autofilled);
      }
      submitSearch();
    }
  }, [userShouldBeSearched, autofilled]);

  const onChangeSearchBox = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    let searchAddress = event.target.value;

    if (searchAddress === '') {
      clearInput();
    } else {
      setSearchedUser(searchAddress);
    }
  };

  const submitSearch = (): void => {
    setActiveTab(3);
  };

  const clearInput = (): void => {
    setSearchedUser('');
    setHasUserBeenSearched(false);
    setIsLoadingSearch(false);
  };

  return (
    <ItemVV2
      alignItems="stretch"
      justifyContent="flex-start"
      flex="0"
    >
      {(activeTab === 3 || activeTab === 4) && (
        <ItemHV2
          justifyContent="flex-start"
          width="100%"
          flex="initial"
          margin="20px 0px 12px 0px"
          padding="0px 0px 14px 0px"
          style={{ borderBottom: '2px solid #D53893' }}
        >
          <ImageV2
            src={ArrowLeft}
            height="18px"
            width="22px"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setActiveTab(0);
              clearInput();
            }}
          />
          <SpanV2
            color="#D53893"
            margin="0px 0px 0px 7px"
          >
            Back
          </SpanV2>
        </ItemHV2>
      )}
      <ItemHV2
        justifyContent="space-between"
        width="100%"
        flex="initial"
      >
        <ItemVV2
          alignItems="stretch"
          display={activeTab == 4 ? 'none' : 'flex'}
        >
          <Input
            type="text"
            onKeyUp={(e) => (e.key === 'Enter' ? submitSearch() : null)}
            value={searchedUser}
            typed={!!searchedUser}
            onChange={onChangeSearchBox}
            placeholder="Search Web3 domain or 0x123..."
          />
          {searchedUser.length > 0 && (
            <CloseIconStyled
              theme={theme}
              width="24px"
              height="24px"
              onClick={clearInput}
            />
          )}
          <ItemVV2
            position="absolute"
            alignItems="flex-end"
            width="24px"
            height="24px"
            top="22px"
            right="16px"
          >
            {isLoadingSearch && (
              <LoaderSpinner
                type={LOADER_TYPE.SEAMLESS}
                width="auto"
                spinnerSize={24}
                spinnerColor={theme.default.secondaryColor}
              />
            )}
            {!searchedUser && (
              <ItemVV2
                alignItems="center"
                justifyContent="center"
                background={theme.chat.snapFocusBg}
                padding="4px"
              >
                <SearchIcon
                  style={{ cursor: 'pointer' }}
                  onClick={submitSearch}
                />
              </ItemVV2>
            )}
          </ItemVV2>
        </ItemVV2>

        {activeTab !== 3 && activeTab !== 4 && (
          <Box margin="spacing-none spacing-none spacing-none spacing-xs">
            <Button
              iconOnly
              leadingIcon={<AddIconStyled />}
              circular
              size="small"
              onClick={() => setActiveTab(3)}
            />
          </Box>
        )}
      </ItemHV2>
    </ItemVV2>
  );
};

const Input = styled.input<InputProps>`
  box-sizing: border-box;
  display: flex;
  font-size: 14px;
  flex: 1;
  width: 100%;
  height: 48px;
  padding: ${(props) => (props.typed ? '13px 42px 13px 21px' : '13px 21px 13px 21px')};
  margin: 10px 0px 10px 0px;
  border-radius: 99px;
  border: 1px solid transparent !important;
  background-color: ${(props) => props.theme.chat.snapFocusBg};
  color: ${(props) => props.theme.default.color || '#000'};
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
`;

export default SearchBar;

const CloseIconStyled = styled(CloseIcon)`
  color: ${(props) => props.theme.default.color || '#000'};
  position: absolute;
  cursor: pointer;
  background: transparent;
  top: 22px;
  right: 14px;
  z-index: 1;
`;

const AddIconStyled = styled(AddIcon)`
  color: #ffffff;
  font-size: 24px;
`;

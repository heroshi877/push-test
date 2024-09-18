// React + Web3 Essentials
import { useState, useEffect } from 'react';

// External Packages
import { MultiSelect } from 'react-multi-select-component';
import styled, { useTheme } from 'styled-components';
import { ThemeProvider } from 'styled-components';
import DateTimePicker from 'react-datetime-picker';
import { Box, Button } from 'blocks';

// Constants
const DEBOUNCE_TIMEOUT = 500; //time in millisecond which we want to wait for then to finish typing

const SearchFilter = ({
  notifications,
  filterNotifications,
  filter,
  reset,
  loadFilter,
  showFilter,
  setShowFilter,
  search,
  setSearch,
}) => {
  // const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const themes = useTheme();

  useEffect(() => {
    const searchForChannel = () => {
      if (search) {
        if (search.length > 0) {
          applySearch();
        }
      } else {
        reset();
      }
    };

    const timeout = setTimeout(searchForChannel, DEBOUNCE_TIMEOUT);
    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  useEffect(() => {
    // this is done so that we only make a request after the user stops typing
  }, [search]);

  const applySearch = async () => {
    var channels = [];
    selectedOption.length ? selectedOption.map((each) => channels.push(each.value)) : (channels = []);
    await filterNotifications(search, channels, startDate, endDate);
  };

  var options = [];
  notifications.map((each) => options.push({ label: each.app, value: each.channel }));
  var uniqueOptions = [...new Map(options.map((item) => [item['value'], item])).values()];
  const [selectedOption, setSelectedOption] = useState(uniqueOptions);

  const resetIt = async () => {
    setStartDate(null);
    setEndDate(null);
    setSearch('');
    setSelectedOption(uniqueOptions);
    reset();
    setShowFilter(false);
  };

  if (!showFilter) return <></>;

  return (
    <ThemeProvider theme={themes}>
      <Container>
        <SearchOptions>
          <SectionSearch
            mright="3.5rem"
            mtop="28px"
          >
            <LabelText>Keywords</LabelText>
            <InputWrapper>
              <Input
                value={search}
                type="text"
                placeholder="eg: push "
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </InputWrapper>
            <LabelText>From</LabelText>
            <SelectChannel>
              <SMultiSelect
                options={uniqueOptions}
                valueRenderer={() => {
                  if (selectedOption.length === 0) return 'eg: ethereum';
                  return `${selectedOption.length} Selected`;
                }}
                value={selectedOption}
                onChange={setSelectedOption}
                labelledBy="Search Notifications from"
                placeholder="Search Notifications from"
              />
            </SelectChannel>
          </SectionSearch>
          <SectionSearch
            mleft="3.5rem"
            mtop="28px"
          >
            <LabelText>Start Date</LabelText>
            <RangeSection mtop="0.5rem">
              <SDateTimePicker
                className="date"
                value={startDate}
                onChange={setStartDate}
              />
            </RangeSection>
            <LabelText>End Date</LabelText>
            <RangeSection>
              <SDateTimePicker
                className="date"
                value={endDate}
                onChange={setEndDate}
              />
            </RangeSection>
          </SectionSearch>
        </SearchOptions>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
          margin="spacing-xxxs spacing-lg spacing-md spacing-none"
          gap="s2"
        >
          <Button
            variant="outline"
            size="small"
            onClick={resetIt}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={applySearch}
          >
            Search
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

const SDateTimePicker = styled(DateTimePicker)`
  padding-right: 4px;
  flex: 6;
  display: flex;
  align-items: center !important;
  font-family: FK Grotesk Neu, Source Sans Pro;
  .react-datetime-picker__wrapper {
    border: 0px !important;
    border-radius: 5px !important;
    height: 40px !important;
  }

  .react-datetime-picker__inputGroup {
    text-align: center !important;
    @media (max-width: 850px) {
      width: 4rem !important;
      margin-right: -2px !important;
      margin: 0px !important;
    }
  }

  .react-datetime-picker__inputGroup__input {
    font-weight: 500 !important;
  }
  .react-datetime-picker__inputGroup__input {
    font-weight: 500 !important;
    color: ${(props) => (props.theme.scheme === 'dark' ? `#fff` : `#000`)};
  }

  .react-datetime-picker__button svg {
    stroke: ${(props) => (props.theme.scheme === 'dark' ? `#fff` : `#000`)};
  }
  .react-datetime-picker__button {
    @media (max-width: 850px) {
      margin: 4px !important;
      padding: 0px !important;
    }
  }
  .react-datetime-picker__inputGroup__input--hasLeadingZero {
    font-weight: 500 !important;
  }
  .react-datetime-picker__inputGroup__minute {
    font-weight: 400 !important;
  }

  .react-datetime-picker__clock {
    display: none;
  }
  .react-datetime-picker__inputGroup__divider {
    font-weight: 400;
  }
`;

const TimeLabelDiv = styled.div`
  flex: 2;
  padding: 0 10px;
  background-color: #35c5f3;
  align-self: stretch;
  text-align: center;
  color: white;
  font-weight: bold;

  div {
    margin-top: 10px;
    font-family: Source Sans Pro;
  }

  @media (max-width: 400px) {
    padding: 0 4px;
  }
`;

const SMultiSelect = styled(MultiSelect)`
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  margin-top: 3px;
  .search input {
    color: ${(props) => (props.theme.scheme === 'dark' ? `#fff` : `#000`)};
  }

  input {
    height: 35px;
    outline: none !important;
    border: 0px solid white !important;
    background-color: inherit;
  }

  /* Aligns the option label with the checkbox */
  .select-item {
    position: relative;
  }
  .select-item span {
    position: absolute;
    margin-top: 7px;
    margin-left: 22px;
  }
  .dropdown-container {
    border: 0px solid white !important;
    margin: 0px !important;
    padding: 0px !important;
    /* background: #F4F5FA; */
    background: ${(props) => props.theme.backgroundBG};
  }

  .dropdown-heading {
    &:focus {
      border: 0px solid white !important;
      box-shadow: 0 0 0px white !important;
    }
  }

  .dropdown-content {
    .panel-content {
      overflow: hidden;
      font-family: FK Grotesk Neu, Source Sans Pro;
      font-weight: 18px;
    }
  }

  .dropdown-container {
    border: 0px solid white !important;
    margin: 0px !important;
    padding: 0px !important;
  }

  .dropdown-container {
    &:focus-within {
      border: 0px solid white !important;
      box-shadow: 0 0 0 0px white !important;
    }
  }

  ${(props) =>
    props.theme.scheme === 'dark' &&
    `
        --rmsc-main: #4285f4;
        --rmsc-hover: #0e0c0a;
        --rmsc-selected: #1d1915;
        --rmsc-border: #333333;
        --rmsc-gray: #555555;
        --rmsc-bg: #000000;
        color: #fff;
    `}
`;

const LabelText = styled.div`
  height: 23px;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
  color: ${(props) => props.theme.color};
  margin-bottom: 10px;
`;

const SelectChannel = styled.div`
  border: 1px solid ${(props) => props.theme.faucetBorder};
  border-radius: 5px;
  font-family: FK Grotesk Neu, Source Sans Pro;
  font-style: normal;
  font-weight: 400;
  /* background: #F4F5FA; */
  background: ${(props) => props.theme.backgroundBG};
  font-size: 15px;
`;

const Input = styled.input`
  border: 0px solid white;
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  position: relative;
  padding-left: 0.7rem;
  width: 100%;
  height: 35px;
  outline: none !important;
  border: 0px solid white !important;
  font-weight: 400;
  background-color: inherit;
  border: 1px solid #bac4d6;
  border-radius: 8px;
  color: ${(props) => props.theme.color};
  &::placeholder {
    opacity: 1;
    font-weight: 400;
    font-family: FK Grotesk Neu, Source Sans Pro;
    // color: #B0B0B0 !important;
    color: ${(props) => props.theme.color};
  }
`;

const RangeSection = styled.div`
  display: flex;
  flex-direction: row;
  border: 1px solid ${(props) => props.theme.faucetBorder};
  border-radius: 5px;
  justify-content: space-between;
  align-items: center;
  height: '40px';
  margin-bottom: 28px;

  position: relative;
  margin-top: ${(props) => (props.mttop ? props.mttop : '')};
  @media (max-width: 600px) {
    margin-top: ${(props) => (props.mtop ? props.mtop : '')};
  }
`;

const Container = styled.div`
  width: -webkit-fill-available;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.backgroundBG};
  border: 1px solid ${(props) => props.theme.faucetBorder};
  border-radius: 10px;
  margin: 1.3rem;
  position: absolute;
  z-index: 2;
  top: 43px;
  padding: 0;
  @media (max-width: 600px) {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    padding: 0.5rem;
  }
`;

const SearchOptions = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 2rem;
  margin-right: 2rem;
  font-family: FK Grotesk Neu, Source Sans Pro;

  @media (max-width: 600px) {
    flex-direction: column;
    justify-content: center;
    align-item: center;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
`;

const SectionSearch = styled.div`
  flex: 1;
  @media (min-width: 600px) {
    margin-right: ${(props) => (props.mright ? props.mright : '')};
    margin-left: ${(props) => (props.mleft ? props.mleft : '')};
    margin-top: ${(props) => (props.mtop ? props.mtop : '')};
  }
  @media (max-width: 600px) {
    margin-top: 1.5rem;
  }
`;

const InputWrapper = styled.div`
  height: 40px;
  border: 1px solid ${(props) => props.theme.faucetBorder};
  border-radius: 5px;
  padding: 1px;
  margin-bottom: 28px;
  @media (max-width: 600px) {
    margin-bottom: 1rem;
  }
`;

export default SearchFilter;

// React + Web3 Essentials
import { Fragment, useEffect, useState } from 'react';

// External Packages
import styled from 'styled-components';

// Internal Components
import FaucetInfo from './FaucetInfo';
import { Item, Span } from 'primaries/SharedStyling';
import { Button } from 'blocks';

// Internal Configs
import { useAccount, useAsyncOperation, useDeviceWidthCheck } from 'hooks';
import { device } from 'config/Globals';
import { getPushTokenFromWallet, importPushToken, mintPushToken } from 'helpers';
import { SpanV2 } from './reusables/SharedStylingV2';
import LoaderSpinner, { LOADER_TYPE } from './reusables/loaders/LoaderSpinner';

const StakingInfo = ({ channelStakeFees, setStakeFeesChoosen, setProcessingInfo, handleCreateChannel }) => {
  const { loading, error, executeAsyncFunction: executeImportPushTokenFunc } = useAsyncOperation(importPushToken);
  const { provider, account } = useAccount();
  const [balance, setBalance] = useState(0);
  // const [loading,setLoading] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);

  const isMobile = useDeviceWidthCheck(600);

  // mint PUSH token
  const mintPushTokenHandler = async (noOfTokens: number) => {
    setFaucetLoading(true);
    const amount = await mintPushToken({ noOfTokens, provider, account });
    setProcessingInfo(amount + 'PUSH Tokens minted successfully!');
    setFaucetLoading(false);
    setBalance(amount);
  };

  //getPushToken from the wallet
  const pushTokenInWallet = async () => {
    const amount = await getPushTokenFromWallet({
      address: account,
      provider: provider,
    });
    setBalance(amount);
  };

  const handlePushTokenImport = async () => {
    await executeImportPushTokenFunc({ provider: provider });
  };

  useEffect(() => {
    pushTokenInWallet();
  }, [balance]);

  return (
    <Fragment>
      {/* <Content padding="0px 0px 0px 0px"> */}
      <ItemContent>
        <Item
          self="center"
          maxWidth="800px"
          width="100%"
          margin="60px 0px 0px 0px"
        >
          <TabSpace>
            <p>Amount for Staking</p>

            <TokenStatus>
              <b>{channelStakeFees} PUSH</b>
              <Tokenbalance>Balance: {balance}</Tokenbalance>
            </TokenStatus>
          </TabSpace>

          {faucetLoading ? (
            <LoaderSpinner type={LOADER_TYPE.SEAMLESS} />
          ) : (
            <FaucetInfo
              onMintPushToken={mintPushTokenHandler}
              noOfPushTokensToCheck={50}
            />
          )}

          <ImportToken>
            Don't see Push token in your wallet?
            <SpanText onClick={handlePushTokenImport}>Import Token </SpanText>
            {loading && (
              <span>
                <LoaderSpinner
                  type={LOADER_TYPE.SEAMLESS}
                  spinnerSize={20}
                />
              </span>
            )}
          </ImportToken>
        </Item>

        <Item
          width="12.2em"
          self="stretch"
          align="stretch"
          margin={isMobile ? '70px auto 50px auto' : '100px auto 50px auto'}
        >
          <Button
            onClick={() => {
              setStakeFeesChoosen(true);
              handleCreateChannel();
            }}
            variant="primary"
            size="large"
          >
            Create Channel
          </Button>
        </Item>
      </ItemContent>
      {/* </Content> */}
    </Fragment>
  );
};
const TabSpace = styled.div`
  width: 97%;
  display: flex;
  justify-content: space-between;
  height: 100px;
  border-radius: 20px;
  background-color: #f4f5fa;
  align-items: center;
  z-index: 1;

  @media ${device.tablet} {
    width: 100%;
  }

  p {
    text-align: center;
    color: #1e1e1e;
    font-weight: 500;
    font-size: 20px;
    letter-spacing: normal;
    margin-left: 50px;
    @media (max-width: 768px) {
      margin-left: 20px;
      font-size: 18px;
    }
  }
  b {
    font-style: normal;
    font-weight: 600;
    font-size: 26px;
    line-height: 150%;
    text-align: right;
    letter-spacing: normal;
    color: #cf1c84;
    margin-right: 50px;
    @media (max-width: 758px) {
      margin-right: 20px;
      font-size: 26px;
    }
  }
`;

const TokenStatus = styled.div`
  display: flex;
  flex-direction: column;
`;
const Tokenbalance = styled.div`
  margin: 0px;
  font-family: 'FK Grotesk Neu';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 140%;
  display: flex;
  align-items: center;
  text-align: center;
  color: #657795;
`;

const ImportToken = styled.div`
  align-self: end;
  font-family: 'FK Grotesk Neu';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  color: #657795;
  margin: 10px 45px 10px 0px;
  display: flex;
  align-items: center;
`;

const SpanText = styled(SpanV2)`
  color: #d53a94;
  font-weight: 600;
  cursor: pointer;
  margin: 0px 5px;

  &:hover {
    text-decoration: underline;
  }
`;

const ItemContent = styled(Item)`
  padding: 5px 0 0 0;
  self: stretch;
  align: flex-start;
  justify: center;
  width: 100%;
`;

export default StakingInfo;

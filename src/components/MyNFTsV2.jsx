// React + Web3 Essentials
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

// External Packages
import styled from 'styled-components';

// Internal Compoonents
import LoaderSpinner, { LOADER_TYPE } from 'components/reusables/loaders/LoaderSpinner';
import { ItemVV2 } from 'components/reusables/SharedStylingV2';
import ViewNFTV2Item from 'components/ViewNFTsV2Item';
import NFTHelper from 'helpers/NFTHelper';
import DisplayNotice from '../primaries/DisplayNotice';
import { ItemH } from '../primaries/SharedStyling';
import { useAccount } from 'hooks';

// Internal Configs
import { abis, addresses, appConfig } from 'config/index.js';

// Create Header
function MyNFTs({ controlAt, setControlAt, setTokenId }) {
  const { account, provider, chainId } = useAccount();

  const [nftReadProvider, setNftReadProvider] = useState(null);
  const [nftWriteProvider, setNftWriteProvider] = useState(null);
  const [NFTRewardsV2Contract, setNFTRewardsV2Contract] = useState(null);
  const [NFTObjects, setNFTObjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const onMainnetCore = chainId === appConfig.mainnetCoreContractChain;

  const mainnetCoreProvider = onMainnetCore ? provider : new ethers.providers.JsonRpcProvider(appConfig.mainnetCoreRPC);

  useEffect(() => {
    if (!!(mainnetCoreProvider && account)) {
      const contractInstance = new ethers.Contract(addresses.rockstarV2, abis.rockstarV2, mainnetCoreProvider);
      setNftReadProvider(contractInstance);
      let signer = mainnetCoreProvider.getSigner(account);
      const signerInstance = new ethers.Contract(addresses.rockstarV2, abis.rockstarV2, signer);
      setNftWriteProvider(signerInstance);
      const NFTRewardsV2Instance = new ethers.Contract(addresses.NFTRewardsV2, abis.NFTRewardsV2, signer);
      setNFTRewardsV2Contract(NFTRewardsV2Instance);
    }
  }, [account]);

  useEffect(() => {
    if (nftReadProvider) {
      fetchNFTDetails();
    }
  }, [account, nftReadProvider]);

  // to fetch NFT Details
  const fetchNFTDetails = async () => {
    let balance = await NFTHelper.getNFTBalance(account, nftReadProvider);
    setLoading(false);
    for (let i = 0; i < balance; i++) {
      let tokenId = await NFTHelper.getTokenOfOwnerByIndex(account, i, nftReadProvider);
      if (tokenId < 1 || tokenId > 100) return;
      // let tokenURI = await NFTHelper.getTokenURIByIndex(tokenId, nftReadProvider);
      let NFTObject = await NFTHelper.getTokenData(tokenId, nftReadProvider, NFTRewardsV2Contract);
      let url = await callFunction(NFTObject.metadata);
      NFTObject['nftInfo'] = url;
      setNFTObjects((prev) => [...prev, NFTObject]);
    }
  };

  const callFunction = async (tokenURI) => {
    let tokenUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
    let response = await fetch(`${tokenUrl}`);
    let data = await response.json();
    return data;
  };

  return (
    <ItemVV2 margin="32px 0 0 0">
      {loading && (
        <ContainerInfo>
          <LoaderSpinner
            type={LOADER_TYPE.SEAMLESS}
            spinnerSize={40}
          />
        </ContainerInfo>
      )}

      {!loading && NFTObjects.length == 0 && (
        <ContainerInfo>
          <DisplayNotice title="No ROCKSTAR NFTs are available in your account" />
        </ContainerInfo>
      )}

      {!loading && NFTObjects.length != 0 && (
        <ItemH margin="20px 0 0 0">
          {Object.keys(NFTObjects).map((index) => {
            if (NFTObjects) {
              return (
                <ViewNFTV2Item
                  key={NFTObjects[index].id}
                  NFTObject={NFTObjects[index]}
                  nftReadProvider={nftReadProvider}
                  nftWriteProvider={nftWriteProvider}
                  controlAt={controlAt}
                  setControlAt={setControlAt}
                  setTokenId={setTokenId}
                />
              );
            }
          })}
        </ItemH>
      )}
    </ItemVV2>
  );
}

// css styles
const ContainerInfo = styled.div`
  padding: 20px;
`;

// Export Default
export default MyNFTs;

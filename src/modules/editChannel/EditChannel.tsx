// React + Web3 Essentials
import { ethers } from 'ethers';
import { useEffect, useState, useRef } from 'react';

// External Packages
import { useSelector } from 'react-redux';
import styled from 'styled-components';

// Internal Compoonents
import { ItemHV2, ItemVV2 } from 'components/reusables/SharedStylingV2';
import { useAccount, useDeviceWidthCheck } from 'hooks';
import FaucetInfo from 'components/FaucetInfo';

// Internal Configs
import { addresses } from 'config/index.js';
import GLOBALS, { device } from 'config/Globals';
import { Button } from 'blocks';
import EditChannelForms from './EditChannelForms';
import useToast from 'hooks/useToast';
import { MODAL_POSITION } from 'hooks/useModalBlur';
import { useClickAway } from 'react-use';
import { LOADER_SPINNER_TYPE } from 'components/reusables/loaders/LoaderSpinner';
import VerifyLogo from '../../assets/Vector.svg';
import { MdCheckCircle, MdError } from 'react-icons/md';
import uploadLogoModal from './uploadLogoModal';
import { approvePushToken, getPushTokenApprovalAmount, mintPushToken } from 'helpers';
import { getCAIPObj } from 'helpers/CaipHelper';
import { IPFSupload } from 'helpers/IpfsHelper';
import { isEmpty } from 'helpers/InputValidation';
import { isLengthValid, isValidUrl } from 'helpers/ValidationHelper';
import { handleLogoSizeLimitation, toDataURL } from 'helpers/LogoSizeHelper';

export default function EditChannel({ closeEditChannel, UploadLogoComponent, displayUplaodLogoModal }) {
  const { account, provider } = useAccount();
  const {
    channelDetails,
    aliasDetails: { isAliasVerified, aliasAddrFromContract },
  } = useSelector((state) => state.admin);

  const { epnsReadProvider, epnsWriteProvider } = useSelector((state) => state.contracts);

  // it can be fetched from contract for dynamic, but making it const will be fast
  const minFeesForAddChannel = 50;

  const [channelName, setChannelName] = useState(channelDetails?.name);
  const [channelInfo, setChannelInfo] = useState(channelDetails?.info);
  const [channelURL, setChannelURL] = useState(channelDetails?.url);
  const [channelLogo, setChannelLogo] = useState(channelDetails?.icon);
  // const [channelFile, setChannelFile] =  useState(undefined);
  const [channelFile, setChannelFile] = useState(channelDetails?.icon);
  const [croppedImage, setCroppedImage] = useState(channelDetails?.icon);
  const [imageSrc, setImageSrc] = useState(croppedImage);
  const [imageType, setImageType] = useState(null);
  const [pushDeposited, setPushDeposited] = useState(false);

  const [errorInfo, setErrorInfo] = useState<{ name: string; description: string; address: string; url: string }>({
    name: '',
    description: '',
    address: '',
    url: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [feesRequiredForEdit, setFeesRequiredForEdit] = useState(0);
  const [pushApprovalAmount, setPushApprovalAmount] = useState(0);

  const [showUploadLogoModal, setShowUploadLogoModal] = useState(false);
  const editChannelToast = useToast();

  useEffect(() => {
    if (!account) return;

    (async function () {
      const amount = await epnsReadProvider.channelUpdateCounter(account);
      setFeesRequiredForEdit(minFeesForAddChannel * (Number(amount) + 1)); //50
    })();
  }, [account]);

  useEffect(() => {
    if (!account || !provider) return;

    (async function () {
      const pushTokenApprovalAmount = await getPushTokenApprovalAmount({
        address: account,
        provider: provider,
        contractAddress: addresses.epnscore,
      });
      setPushApprovalAmount(parseInt(pushTokenApprovalAmount));
      const amountToBeDeposit = parseInt(pushTokenApprovalAmount);

      if (amountToBeDeposit >= feesRequiredForEdit && amountToBeDeposit != 0) {
        setPushDeposited(true);
      } else {
        setPushDeposited(false);
      }
    })();
  }, [account, provider]);

  const depositPush = async () => {
    setIsLoading(true);
    if (!provider) return;
    const signer = provider.getSigner(account);
    editChannelToast.showLoaderToast({ loaderMessage: 'Waiting for Confirmation...' });
    try {
      const response = await approvePushToken({
        signer,
        contractAddress: addresses.epnscore,
        amount: feesRequiredForEdit - pushApprovalAmount,
      });
      console.debug('response', response);
      if (response) {
        setIsLoading(false);
        setPushApprovalAmount(feesRequiredForEdit);
        setPushDeposited(true);
        editChannelToast.showMessageToast({
          toastTitle: 'Success',
          toastMessage: 'Successfully approved Push!',
          toastType: 'SUCCESS',
          getToastIcon: (size) => (
            <MdCheckCircle
              size={size}
              color="green"
            />
          ),
        });
      }
    } catch (err) {
      console.error(err);
      if (err.code == 'ACTION_REJECTED') {
        // EIP-1193 userRejectedRequest error
        editChannelToast.showMessageToast({
          toastTitle: 'Error',
          toastMessage: `User denied message signature.`,
          toastType: 'ERROR',
          getToastIcon: (size) => (
            <MdError
              size={size}
              color="red"
            />
          ),
        });
      } else {
        editChannelToast.showMessageToast({
          toastTitle: 'Error',
          toastMessage: `There was an error in approving PUSH Token`,
          toastType: 'ERROR',
          getToastIcon: (size) => (
            <MdError
              size={size}
              color="red"
            />
          ),
        });

        console.error('Error --> %o', err);
        console.error({ err });
      }
    }
    setIsLoading(false);
  };

  const closeUploadModal = () => {
    setShowUploadLogoModal(false);
  };

  const isMobile = useDeviceWidthCheck(600);

  const containerRef = useRef(null);
  useClickAway(containerRef, () => {
    closeUploadModal();
  });

  const isAllFilledAndValid = (): boolean => {
    setErrorInfo('');

    if (isEmpty(channelName) || isEmpty(channelInfo) || isEmpty(channelURL)) {
      if (isEmpty(channelName)) {
        setErrorInfo((x) => ({
          ...x,
          name: 'Please, enter the channel name.',
        }));
      }

      if (isEmpty(channelInfo)) {
        setErrorInfo((x) => ({
          ...x,
          description: 'Please, enter the channel description',
        }));
      }

      if (isEmpty(channelURL)) {
        setErrorInfo((x) => ({
          ...x,
          url: 'Please, enter the channel url',
        }));
      }

      return false;
    }

    if (!isLengthValid(channelName, 125)) {
      setErrorInfo((x) => ({
        ...x,
        name: 'Channel Name should not exceed 125 characters! Please retry!',
      }));

      return false;
    }
    if (!isLengthValid(channelURL, 125)) {
      setErrorInfo((x) => ({
        ...x,
        url: 'Channel Url should not exceed 125 characters! Please retry!',
      }));
      return false;
    }
    if (!isValidUrl(channelURL)) {
      setErrorInfo((x) => ({
        ...x,
        url: 'Channel URL is invalid! Please enter a valid url!',
      }));
      return false;
    }

    return true;
  };

  const isDetailsAltered = (): boolean => {
    if (
      channelName !== channelDetails?.name ||
      channelInfo !== channelDetails?.info ||
      channelURL !== channelDetails?.url ||
      channelFile !== channelDetails?.icon
    ) {
      return false;
    } else {
      return true;
    }
  };

  const editChannel = async (e) => {
    try {
      if (!isAllFilledAndValid()) return;

      setIsLoading(true);
      const input = JSON.stringify({
        name: channelName,
        info: channelInfo,
        url: channelURL,
        icon: channelFile,
        aliasDetails:
          channelDetails['aliasDetails'] ||
          getCAIPObj({
            chainId: parseInt(channelDetails['chain_id']),
            address: channelDetails['address'],
          }),
      });

      console.debug(input);
      const storagePointer = await IPFSupload(input);
      console.debug('IPFS storagePointer:', storagePointer);

      const identity = '1+' + storagePointer; // IPFS Storage Type and HASH
      const newIdentityBytes = ethers.utils.toUtf8Bytes(identity);
      const parsedFees = ethers.utils.parseUnits(feesRequiredForEdit.toString(), 18);

      editChannelToast.showLoaderToast({ loaderMessage: 'Waiting for Confirmation...' });
      const tx = await epnsWriteProvider.updateChannelMeta(account, newIdentityBytes, parsedFees, {
        gasLimit: 1000000,
      });

      console.debug(tx);
      await tx.wait();
      setIsLoading(false);

      editChannelToast.showMessageToast({
        toastTitle: 'Success',
        toastMessage: `Channel Updated Successfully`,
        toastType: 'SUCCESS',
        getToastIcon: (size) => (
          <MdCheckCircle
            size={size}
            color="green"
          />
        ),
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      console.error(err.message);

      if (err.code == 'ACTION_REJECTED') {
        // EIP-1193 userRejectedRequest error
        editChannelToast.showMessageToast({
          toastTitle: 'Error',
          toastMessage: `User denied message signature.`,
          toastType: 'ERROR',
          getToastIcon: (size) => (
            <MdError
              size={size}
              color="red"
            />
          ),
        });
      } else {
        editChannelToast.showMessageToast({
          toastTitle: 'Error',
          toastMessage: `There was an error in updating channel Details`,
          toastType: 'ERROR',
          getToastIcon: (size) => (
            <MdError
              size={size}
              color="red"
            />
          ),
        });
        console.error('Error --> %o', err);
        console.error({ err });
      }
    }
  };

  // mint PUSH token
  const mintPushTokenHandler = async (noOfTokens: number) => {
    await mintPushToken({ noOfTokens, provider, account });
  };

  useEffect(() => {
    if (croppedImage) {
      console.debug('Image cropped', croppedImage);
      toDataURL(croppedImage, function (dataUrl) {
        const response = handleLogoSizeLimitation(dataUrl);
        console.debug('response', response);
        if (response.success) {
          console.debug('Cropped Image....', croppedImage);
          setChannelFile(croppedImage);
        }
      });
    }
  }, [croppedImage]);

  return (
    <EditChannelContainer ref={containerRef}>
      {/* Modal to upload Logo */}
      <UploadLogoComponent
        InnerComponent={uploadLogoModal}
        InnerComponentProps={{
          setChannelLogo,
          channelLogo,
          croppedImage,
          setCroppedImage,
          setChannelFile,
          imageSrc,
          setImageSrc,
          imageType,
          setImageType,
          errorInfo,
          setErrorInfo,
        }}
        modalPosition={MODAL_POSITION.ON_PARENT}
      />

      <EditableContainer>
        <AdaptiveMobileItemHV22>
          <ImageSection src={channelLogo}></ImageSection>
          <Button
            variant="secondary"
            onClick={() => {
              displayUplaodLogoModal();
              setShowUploadLogoModal(true);
            }}
          >
            Upload Logo
          </Button>
        </AdaptiveMobileItemHV22>

        {!isMobile && <VerticalLine></VerticalLine>}

        {/* Edit Channel Form */}
        <EditChannelForms
          channelName={channelName}
          setChannelName={setChannelName}
          channelInfo={channelInfo}
          setChannelInfo={setChannelInfo}
          channelURL={channelURL}
          setChannelURL={setChannelURL}
          editChannel={editChannel}
          errorInfo={errorInfo}
          setErrorInfo={setErrorInfo}
        />
      </EditableContainer>

      {/* This is Footer container that is present over the buttons */}
      <Footer>
        <div>
          <FooterPrimaryText>Channel edit fee</FooterPrimaryText>
          <FooterSecondaryText>Editing channel details requires fees to be deposited</FooterSecondaryText>
        </div>
        <ItemHV2 flex="0">
          {pushDeposited ? <TickImage src={VerifyLogo} /> : null}
          <EditFee>{feesRequiredForEdit} PUSH</EditFee>
        </ItemHV2>
      </Footer>
      <FaucetInfo
        noOfPushTokensToCheck={feesRequiredForEdit}
        containerProps={{ width: '100%' }}
        onMintPushToken={mintPushTokenHandler}
      />

      {isLoading ? (
        <>
          {/* Verifying Spinner and Text */}
          <VerifyingContainer>
            <Spinner
              size={42}
              color={GLOBALS.COLORS.PRIMARY_PINK}
              type={LOADER_SPINNER_TYPE.PROCESSING}
            />
            <TransactionText>Verifying Transaction</TransactionText>
          </VerifyingContainer>
        </>
      ) : (
        <>
          {/* This below is Footer Buttons i.e, Cancel and save changes */}
          <ButtonContainer>
            <Button
              onClick={closeEditChannel}
              variant="outline"
              size="large"
            >
              Cancel
            </Button>

            {pushApprovalAmount >= feesRequiredForEdit ? (
              <Button
                disabled={isDetailsAltered()}
                onClick={editChannel}
                size="large"
              >
                Save Changes
              </Button>
            ) : (
              <Button
                onClick={depositPush}
                size="large"
              >
                Approve PUSH
              </Button>
            )}
          </ButtonContainer>
        </>
      )}
    </EditChannelContainer>
  );
}

const EditChannelContainer = styled(ItemVV2)`
  padding: 0px;
  @media (min-width: 1140px) {
    padding: 15px 50px 0px 50px;
  }
`;

const EditableContainer = styled(ItemVV2)`
  flex-direction: row;
  margin-bottom: 10px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
  @media (max-width: 425px) {
    margin-bottom: 40px;
  }
`;

const TickImage = styled.img``;

const AdaptiveMobileItemHV22 = styled(ItemHV2)`
  flex: 0;
  align-items: center;
  align-self: baseline;
  justify-content: center;

  @media (max-width: 767px) {
    justify-content: center;
    flex-direction: column;
  }

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
    flex-direction: column;
  }
`;

const ImageSection = styled.img`
  width: 128px;
  height: 128px;
  margin-bottom: 20px;
  border-radius: 32px;
  @media ${device.mobileL} {
    width: 90px;
    height: 90px;
    margin-right: 0px;
    border-radius: 20px;
  }
`;

const VerticalLine = styled.div`
  height: 21.5rem;
  width: 2px;
  background: ${(props) => props.theme.verticalLineColor};
  margin: 0px 68px;
  @media (min-width: 993px) and (max-width: 1240px) {
    margin: 0px 68px;
  }
  @media (min-width: 600px) and (max-width: 768px) {
    margin: 0px 68px;
  }
`;

const Footer = styled(ItemVV2)`
  background: ${(props) => props.theme.editFooterBg};
  border-radius: 20px;
  padding: 23px 32px;
  display: grid;
  grid-auto-flow: column;
  align-content: space-between;
  justify-content: space-between;
  grid-gap: 40px;
  margin-top: 35px;
  z-index: 1;

  @media (max-width: 600px) {
    padding: 16px;
  }

  @media (max-width: 425px) {
    margin: 0px;
  }
`;

const FooterPrimaryText = styled.p`
  margin: 0px;
  color: ${(props) => props.theme.editChannelPrimaryText};
  font-family: 'FK Grotesk Neu';
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
`;

const FooterSecondaryText = styled.p`
  font-size: 12px;
  margin: 0px;
  font-weight: 400;
  line-height: 130%;
  color: ${(props) => props.theme.editChannelSecondaryText};
`;

const EditFee = styled.p`
  margin: 0px 0px 0px 5px;
  color: #d53893;
  font-family: 'FK Grotesk Neu';
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
`;

const VerifyingContainer = styled(ItemVV2)`
  flex-direction: row;
  margin-top: 33px;
`;

const TransactionText = styled.p`
  font-family: 'FK Grotesk Neu';
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  display: flex;
  align-items: center;
  margin-left: 12px;
  color: ${(props) => props.theme.editChannelPrimaryText};
`;

//Footer Button's CSS
const ButtonContainer = styled(ItemHV2)`
  justify-content: end;
  margin-top: 35px;
  gap: 14px;
  @media (max-width: 425px) {
    flex-direction: column-reverse;
  }
`;

// React + Web3 Essentials
import React from 'react';

// External Packages
import 'react-dropdown/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { toast as toaster } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { useClickAway } from 'react-use';
import styled, { useTheme } from 'styled-components';

// Internal Compoonents
import LoaderSpinner, { LOADER_TYPE } from 'components/reusables/loaders/LoaderSpinner';
import EPNSCoreHelper from 'helpers/EPNSCoreHelper';
import useModalBlur, { MODAL_POSITION } from 'hooks/useModalBlur';
import useToast from 'hooks/useToast';
import cubeIcon from '../assets/icons/cube.png';
import redBellIcon from '../assets/icons/redBellSlash.png';
import greenBellIcon from '../assets/icons/greenBell.svg?react';
import AddSubgraphModalContent from './AddSubgraphModalContent';
import ChannelDeactivateModalContent from './ChannelDeactivateModalContent';
import ChannelReactivateModalContent from './ChannelReactivateModalContent';

// Internal Configs
import { appConfig } from 'config/index.js';
import { useAccount, useDeviceWidthCheck } from 'hooks';

import { ethers } from 'ethers';

const MIN_STAKE_FEES = 50;
const ALLOWED_CORE_NETWORK = appConfig.coreContractChain;

type ChannelSettingsType = {
  DropdownRef: React.MutableRefObject<any>;
  isDropdownOpen: boolean;
  closeDropdown: () => void;
};

// Create Header
function ChannelSettings({ DropdownRef, isDropdownOpen, closeDropdown }: ChannelSettingsType) {
  const dispatch = useDispatch();
  const { account, chainId } = useAccount();
  const { epnsWriteProvider, epnsCommWriteProvider } = useSelector((state: any) => state.contracts);
  const { channelDetails } = useSelector((state: any) => state.admin);
  const { CHANNNEL_DEACTIVATED_STATE, CHANNEL_BLOCKED_STATE } = useSelector((state: any) => state.channels);
  const { userPushSDKInstance } = useSelector((state: any) => {
    return state.user;
  });

  const theme = useTheme();
  const { channelState } = channelDetails;
  const onCoreNetwork = ALLOWED_CORE_NETWORK === chainId;
  const isMobile = useDeviceWidthCheck(425);

  // modals
  const {
    isModalOpen: isDeactivateChannelModalOpen,
    showModal: showDeactivateChannelModal,
    ModalComponent: DeactivateChannelModalComponent,
  } = useModalBlur();
  const {
    isModalOpen: isReactivateChannelModalOpen,
    showModal: showReactivateChannelModal,
    ModalComponent: ReactivateChannelModalComponent,
  } = useModalBlur();
  const {
    isModalOpen: isAddSubgraphModalOpen,
    showModal: showAddSubgraphModal,
    ModalComponent: AddSubgraphModalComponent,
  } = useModalBlur();

  // for closing the ChannelSettings Dropdown upon outside click
  const closeDropdownCondition =
    isDropdownOpen && !isDeactivateChannelModalOpen && !isReactivateChannelModalOpen && !isAddSubgraphModalOpen;
  useClickAway(DropdownRef, () => closeDropdownCondition && closeDropdown());

  const [loading, setLoading] = React.useState(false);
  const [channelStakeFees, setChannelStakeFees] = React.useState(MIN_STAKE_FEES);
  const [poolContrib, setPoolContrib] = React.useState(0);

  // toaster customize
  const LoaderToast = ({ msg, color }) => (
    <Toaster>
      <LoaderSpinner
        type={LOADER_TYPE.SEAMLESS}
        spinnerSize={30}
      />
      <ToasterMsg>{msg}</ToasterMsg>
    </Toaster>
  );

  // Toastify
  let notificationToast = () =>
    toaster.dark(
      <LoaderToast
        msg="Preparing Notification"
        color="#fff"
      />,
      {
        position: 'bottom-right',
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );

  const isChannelDeactivated = channelState === CHANNNEL_DEACTIVATED_STATE;
  const isChannelBlocked = channelState === CHANNEL_BLOCKED_STATE;
  const channelInactive = isChannelBlocked || isChannelDeactivated;

  React.useEffect(() => {
    // To set channel info from a channel details
    // setChannelState(channelDetails.channelState);
    setPoolContrib(+EPNSCoreHelper.formatBigNumberToMetric(channelDetails.poolContribution, true));
  }, [account, channelDetails.poolContribution]);

  const userSignerToast = useToast();
  const toggleChannelActivationState = () => {
    if (isChannelBlocked) return;
    if (isChannelDeactivated) {
      showReactivateChannelModal();
    } else {
      showDeactivateChannelModal();
    }
  };

  const reactivateChannelToast = useToast();
  /**
   * Function to activate a channel that has been deactivated
   */
  const activateChannel = epnsWriteProvider.reactivateChannel;

  const deactivateChannelToast = useToast();
  /**
   * Function to deactivate a channel that has been deactivated
   */
  const deactivateChannel = () => epnsWriteProvider.deactivateChannel();

  const addSubgraphToast = useToast();
  const addSubgraphDetails = async (pollTime, subGraphId) => {
    // design not present to show below cases
    if (pollTime == '' || subGraphId == '') {
      // setLoading('Fields are empty! Retry');
      // setTimeout(() => {
      //     setLoading('')
      // }, 2000);
      return;
    } else if (pollTime < 60) {
      // setLoading('Poll Time must be at least 60 sec');
      // setTimeout(() => {
      //     setLoading('')
      // }, 2000);
      return;
    }

    try {
      const input = pollTime + '+' + subGraphId;

      // Prepare Identity bytes
      const identityBytes = ethers.utils.toUtf8Bytes(input);

      return epnsWriteProvider.addSubGraph(identityBytes);
    } catch (err) {
      console.error(err);
    }
  };

  // if (!onCoreNetwork) {
  //   //temporarily deactivate the deactivate button if not on core network
  //   return <></>;

  return (
    <>
      <div>
        <DropdownWrapper background={theme}>
          <ActiveChannelWrapper>
            {appConfig.appEnv !== 'prod' && (
              <ChannelActionButton
                disabled={channelInactive}
                onClick={() => !channelInactive && showAddSubgraphModal()}
              >
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <CustomIcon
                    src={cubeIcon}
                    alt="cube"
                  />
                  <div style={{ width: '10px' }} />
                  Add SubGraph Details
                </div>
              </ChannelActionButton>
            )}

            {onCoreNetwork && (
              <ChannelActionButton
                isChannelDeactivated={isChannelDeactivated}
                onClick={toggleChannelActivationState}
              >
                <ActivateChannelContainer
                  isChannelBlocked={isChannelBlocked}
                  isChannelDeactivated={isChannelDeactivated}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    {isChannelBlocked ? (
                      <CustomIcon
                        src={redBellIcon}
                        alt="red-bell"
                      />
                    ) : isChannelDeactivated ? (
                      <CustomIcon
                        src={greenBellIcon}
                        alt="green-bell"
                      />
                    ) : (
                      <CustomIcon
                        src={redBellIcon}
                        alt="red-bell"
                      />
                    )}

                    <div style={{ width: '10px' }} />
                    {isChannelBlocked
                      ? 'Channel Blocked'
                      : isChannelDeactivated
                      ? 'Activate Channel'
                      : 'Deactivate Channel'}
                  </div>
                </ActivateChannelContainer>
              </ChannelActionButton>
            )}
          </ActiveChannelWrapper>
        </DropdownWrapper>

        {/* {showActivateChannelPopup && (
          <ActivateChannelModal
            onClose={() => {
              if (showActivateChannelPopup) {
                setShowActivateChannelPopup(false);
              }
            }}
            activateChannel={activateChannel}
            loading={loading}
            setChannelStakeFees={setChannelStakeFees}
            channelStakeFees={channelStakeFees}
          />
        )} */}
      </div>

      {/* deactivate channel modal */}
      <DeactivateChannelModalComponent
        InnerComponent={ChannelDeactivateModalContent}
        onConfirm={deactivateChannel}
        toastObject={deactivateChannelToast}
        modalPosition={MODAL_POSITION.ON_ROOT}
      />

      {/* reactivate channel modal */}
      <ReactivateChannelModalComponent
        InnerComponent={ChannelReactivateModalContent}
        onConfirm={activateChannel}
        toastObject={reactivateChannelToast}
        modalMargin={isMobile ? '10rem 1rem 0 1rem' : ''}
        modalPosition={MODAL_POSITION.ON_ROOT}
      />

      {/* modal to add a subgraph */}
      <AddSubgraphModalComponent
        InnerComponent={AddSubgraphModalContent}
        onConfirm={addSubgraphDetails}
        toastObject={addSubgraphToast}
        modalPosition={MODAL_POSITION.ON_ROOT}
      />
    </>
  );
}

// css styles
const DropdownWrapper = styled.div`
  position: absolute;
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  width: 240px;
  padding: 16px 4px 24px 4px;
  background: ${(props) => props.background.backgroundBG};
  box-sizing: border-box;
  box-shadow: 0px 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e8f7;
  border: 1px solid;
  border-color: ${(props) => props.theme.default.borderColor};
  border-radius: 16px;
  justify-content: space-between;

  @media (max-width: 600px) {
    left: -90px;
    top: 24px;
  }
`;

const ActiveChannelWrapper = styled.div`
  flex-direction: column;
  gap: 20px;
  display: ${(props) => (props.inactive ? 'none' : 'flex')};
`;

const Toaster = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0px 10px;
`;

const ToasterMsg = styled.div`
  margin: 0px 10px;
`;

const DeactivateButton = styled.div`
  text-decoration: underline;
  color: ${(props) => (props.isChannelDeactivated ? '#674C9F' : '#e20880')};
  text-align: center;
  font-size: 16px;
  line-height: 20px;
  cursor: pointer;
`;

const ChannelActionButton = styled.button`
  border: 0;
  outline: 0;
  padding: 8px 15px;
  border-radius: 5px;
  position: relative;
  background: ${(props) => props.theme.backgroundBG};
  color: ${(props) => props.theme.dropdownTextColor};
  height: 23px;
  font-family: 'monospace, monospace';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 141%;
  align-items: center;
  &:hover {
    opacity: ${(props) => (props.disabled ? 0.5 : 0.9)};
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    pointer: hand;
  }
  &:active {
    opacity: ${(props) => (props.disabled ? 0.5 : 0.75)};
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    pointer: hand;
  }
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const ActivateChannelContainer = styled.div`
  color: ${(props) => (props.isChannelBlocked ? 'red' : props.isChannelDeactivated ? '#30CC8B' : 'red ')};
`;

const CustomIcon = styled.img`
  width: 25px;
  height: 25px;
  padding: 0;
  margin: 0;
`;

// Export Default
export default ChannelSettings;

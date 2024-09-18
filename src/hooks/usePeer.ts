import { useContext, useEffect, useState } from 'react';
import { Peer } from 'peerjs';
import { AppContext } from 'contexts/AppContext';

const usePeer = () => {
  const { setLocalPeer, localPeer, setConnectedPeerID } = useContext(AppContext);
  const [myPeer, setPeer] = useState(localPeer.peer);
  const [myPeerID, setMyPeerID] = useState(localPeer.peerID);

  const cleanUp = () => {
    if (myPeer) {
      myPeer.disconnect();
      myPeer.destroy();
    }
    setPeer(null);
    setMyPeerID(null);
    setLocalPeer({ peer: '', peerID: '' });
    setConnectedPeerID({ peerID: '' });
  };

  useEffect(() => {
    const peer = myPeer ? myPeer : new Peer();

    peer.on('open', () => {
      setPeer(peer);
      setMyPeerID(peer.id);
      setLocalPeer({
        peer: peer,
        peerID: peer.id,
      });
    });

    peer.on('connection', (connection) => {
      connection.on('data', (data) => {
        setConnectedPeerID({ peerID: data.peerID });
      });
    });

    peer.on('disconnected', () => {
      cleanUp();
    });

    peer.on('close', () => {
      cleanUp();
    });

    peer.on('error', (error) => {
      cleanUp();
    });
  }, []);

  return [myPeer, myPeerID];
};

export default usePeer;

import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RoomType } from '../../types';
import LCC from 'lightning-container';

const getRunningUser = () => {
  return new Promise<string>((resolve, reject) => {
    LCC.callApex(
      'TwilioVideoController.getRunningUser',
      [],
      (result, event) => {
        if (result) {
          resolve(result);
        } else if (event.type === 'exception') {
          reject(event);
        }
      },
      { escape: false }
    );
  });
};

export function fetchToken(
  identity: string,
  roomName: string,
  createRoom = true,
  createConversation = process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true'
) {
  return new Promise<string>((resolve, reject) => {
    LCC.callApex(
      'TwilioVideoController.getAccessTokenForRemote',
      JSON.stringify({
        identity,
        roomName,
        createRoom,
        createConversation,
      }),
      (result, event) => {
        if (result) {
          resolve(result);
        } else if (event.type === 'exception') {
          reject(event);
        }
      },
      { escape: false }
    );
  });
}

export default function useSalesforceAuth() {
  const history = useHistory();

  const [user, setUser] = useState<{ displayName: undefined; photoURL: undefined; passcode: string } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [roomType, setRoomType] = useState<RoomType>();

  const getToken = useCallback((name: string, room: string) => {
    return fetchToken(name, room).then(result => {
      const something = JSON.parse(result);
      const { roomType, token } = something;
      setRoomType(roomType);
      return token as string;
    });
  }, []);

  useEffect(() => {
    getRunningUser()
      .then(salesforceUserJSON => {
        const salesforceUser = JSON.parse(salesforceUserJSON);
        setUser({ displayName: salesforceUser.name } as any);
        setIsAuthReady(true);
      })
      .catch(e => {
        console.error(e);
      });
  }, [history]);

  return { getToken, user, isAuthReady, roomType };
}

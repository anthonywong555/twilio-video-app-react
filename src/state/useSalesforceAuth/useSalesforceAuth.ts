import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import LCC from 'lightning-container';

export default function useSalesforceAuth() {
  const history = useHistory();

  const [user, setUser] = useState<{ displayName: undefined; photoURL: undefined; passcode: string } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(true);

  const getToken = useCallback((name: string, room: string) => {
    return new Promise<string>((resolve, reject) => {
      LCC.callApex(
        'TwilioVideoController.getAccessTokenForRemote',
        JSON.stringify({ identity: name, roomName: room }),
        (result, event) => {
          if (result) {
            resolve(result);
          } else if (event.type === 'exception') {
            reject(event);
          }
        },
        []
      );
    });
  }, []);

  useEffect(() => {
    setUser({ passcode: null } as any);
    setIsAuthReady(true);
  }, [history]);

  return { isAuthReady, getToken, user };
}

import { createContext, useContext, useMemo, useState } from 'react';
import { signupRequests as initialSignupRequests } from '../data/webAdminData.js';

const WebAdminContext = createContext(null);

export function WebAdminProvider({ children }) {
  const [signupRequests, setSignupRequests] = useState(initialSignupRequests);

  const approveSignupRequest = (id) => {
    setSignupRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === id
          ? {
              ...request,
              status: 'approved',
              rejectReason: '',
            }
          : request,
      ),
    );
  };

  const rejectSignupRequest = (id, rejectReason) => {
    setSignupRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === id
          ? {
              ...request,
              status: 'rejected',
              rejectReason,
            }
          : request,
      ),
    );
  };

  const value = useMemo(
    () => ({
      signupRequests,
      findSignupRequestById: (id) => signupRequests.find((request) => request.id === id),
      approveSignupRequest,
      rejectSignupRequest,
    }),
    [signupRequests],
  );

  return <WebAdminContext.Provider value={value}>{children}</WebAdminContext.Provider>;
}

export function useWebAdmin() {
  const context = useContext(WebAdminContext);

  if (!context) {
    throw new Error('useWebAdmin must be used inside WebAdminProvider.');
  }

  return context;
}

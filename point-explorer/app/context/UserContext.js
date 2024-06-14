// UserContext.tsx
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const registerUser = async (email, password, onSuccess) => {
    try {
      // Perform your registration logic here (e.g., API call)
      // Assuming registration is successful:
      setUser({ email });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, registerUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

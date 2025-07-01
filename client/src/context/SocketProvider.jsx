import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

/**
 * Context for providing socket.io instance throughout the application
 * @type {React.Context<import('socket.io-client').Socket|null>}
 */
const SocketContext = createContext(null);

/**
 * Custom hook to access the socket instance from any component
 * @returns {import('socket.io-client').Socket} The socket.io instance
 * @throws {Error} If used outside of a SocketProvider
 */
export const useSocket = () => {
  const socket = useContext(SocketContext);
  
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  
  return socket;
};

/**
 * Provider component that makes the socket instance available to any
 * nested component that calls useSocket()
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const SocketProvider = ({ children }) => {
  // Create socket connection only once using useMemo
  const socket = useMemo(() => {
    // Create and configure the socket instance
    const socketInstance = io("http://localhost:5015/", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    return socketInstance;
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
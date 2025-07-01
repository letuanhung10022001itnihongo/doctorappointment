import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

/**
 * LobbyScreen Component
 * 
 * Provides a UI for users to enter their email and room number
 * to join a video conference room.
 */
const LobbyScreen = () => {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  // Hooks for navigation and socket connection
  const socket = useSocket();
  const navigate = useNavigate();

  /**
   * Handles form submission
   * Emits a socket event to join the specified room
   */
  const handleSubmitForm = useCallback((e) => {
    e.preventDefault();
    socket.emit("room:join", { email, room });
  }, [email, room, socket]);

  /**
   * Callback for when server confirms room joining
   * Navigates to the room page with the room ID
   */
  const handleJoinRoom = useCallback((data) => {
    const { room } = data;
    navigate(`/room/${room}`);
  }, [navigate]);

  // Setup socket event listener on component mount
  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    
    // Cleanup listener on component unmount
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          required
        />
        <br />
        <button type="submit">Join</button>
      </form>
    </div>
  );
};

export default LobbyScreen;
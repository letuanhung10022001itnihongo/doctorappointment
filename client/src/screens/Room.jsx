/**
 * Video Chat Room Component
 * 
 * This component implements a WebRTC peer-to-peer video chat room using socket.io for signaling.
 * It handles negotiation between peers, media stream management, and rendering video streams.
 */
import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  // Get socket connection from context
  const socket = useSocket();
  
  // State management
  const [remoteSocketId, setRemoteSocketId] = useState(null); // ID of the remote peer
  const [myStream, setMyStream] = useState(null); // Local media stream
  const [remoteStream, setRemoteStream] = useState(null); // Remote media stream

  /**
   * Handle when another user joins the room
   * Updates the remote socket ID when a new user connects
   */
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`User ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  /**
   * Initiate a call to the remote user
   * Requests local media stream and creates an offer to send to the remote peer
   */
  const handleCallUser = useCallback(async () => {
    try {
      // Get local media stream (audio and video)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      
      // Create and send offer to remote peer
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
      
      // Save local stream
      setMyStream(stream);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  }, [remoteSocketId, socket]);

  /**
   * Handle incoming call from another user
   * Accepts the call by creating an answer to the remote peer's offer
   */
  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    try {
      // Save remote peer ID
      setRemoteSocketId(from);
      
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      
      // Create answer to the offer
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    } catch (error) {
      console.error("Error handling incoming call:", error);
    }
  }, [socket]);

  /**
   * Send local media streams to the peer connection
   * Adds all tracks from local stream to the peer connection
   */
  const sendStreams = useCallback(() => {
    if (!myStream) return;
    
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  /**
   * Handle when a call is accepted by the remote peer
   * Sets the local description and sends local streams
   */
  const handleCallAccepted = useCallback(({ from, ans }) => {
    peer.setLocalDescription(ans);
    console.log("Call Accepted!");
    sendStreams();
  }, [sendStreams]);

  /**
   * Handle renegotiation needed events
   * Creates a new offer and sends it to the remote peer
   */
  const handleNegoNeeded = useCallback(async () => {
    try {
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    } catch (error) {
      console.error("Negotiation error:", error);
    }
  }, [remoteSocketId, socket]);

  /**
   * Add negotiation event listener to peer connection
   */
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  /**
   * Handle incoming negotiation request
   * Creates an answer to the remote peer's offer
   */
  const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
    try {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    } catch (error) {
      console.error("Error handling negotiation:", error);
    }
  }, [socket]);

  /**
   * Handle final step of negotiation
   * Sets the local description to complete the negotiation
   */
  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    try {
      await peer.setLocalDescription(ans);
    } catch (error) {
      console.error("Error finalizing negotiation:", error);
    }
  }, []);

  /**
   * Listen for tracks from remote peer
   * Sets the remote stream when tracks are received
   */
  useEffect(() => {
    const handleTrack = (ev) => {
      const streams = ev.streams;
      console.log("Received remote tracks");
      if (streams && streams.length > 0) {
        setRemoteStream(streams[0]);
      }
    };

    peer.peer.addEventListener("track", handleTrack);
    return () => {
      peer.peer.removeEventListener("track", handleTrack);
    };
  }, []);

  /**
   * Set up socket event listeners
   */
  useEffect(() => {
    // Register event handlers
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    // Cleanup function to remove event listeners
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="video-room">
      <h1>Video Chat Room</h1>
      
      {/* Connection status */}
      <h4>{remoteSocketId ? "Connected to peer" : "Waiting for someone to join..."}</h4>
      
      {/* Call controls */}
      <div className="control-buttons">
        {remoteSocketId && !myStream && <button onClick={handleCallUser}>Start Call</button>}
        {myStream && !remoteStream && <button onClick={sendStreams}>Send Video</button>}
      </div>
      
      {/* Video streams */}
      <div className="video-streams">
        {myStream && (
          <div className="stream-container">
            <h3>My Stream</h3>
            <ReactPlayer
              playing
              muted
              height="200px"
              width="350px"
              url={myStream}
            />
          </div>
        )}
        
        {remoteStream && (
          <div className="stream-container">
            <h3>Remote Stream</h3>
            <ReactPlayer
              playing
              height="200px"
              width="350px"
              url={remoteStream}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
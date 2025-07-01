/**
 * PeerService - A class to manage WebRTC peer connections
 * Handles the creation of offers and answers for WebRTC communication
 */
class PeerService {
  constructor() {
    // Create RTCPeerConnection instance with STUN servers
    // STUN servers help establish connections between peers behind NATs
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }

  /**
   * Creates an offer to initiate a WebRTC connection
   * @returns {Promise<RTCSessionDescriptionInit>} The created offer
   */
  async getOffer() {
    // Create an offer and set it as the local description
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  }

  /**
   * Creates an answer in response to an offer
   * @param {RTCSessionDescriptionInit} offer - The offer from the remote peer
   * @returns {Promise<RTCSessionDescriptionInit>} The created answer
   */
  async getAnswer(offer) {
    // Set the remote description (the offer) and create an answer
    await this.peer.setRemoteDescription(offer);
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(new RTCSessionDescription(answer));
    return answer;
  }

  /**
   * Sets the remote description with the provided answer
   * @param {RTCSessionDescriptionInit} answer - The answer from the remote peer
   */
  async setLocalDescription(answer) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
  }
}

export default new PeerService();
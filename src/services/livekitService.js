import { Room, RoomEvent } from 'livekit-client';

class LiveKitService {
  constructor() {
    this.room = null;
    this.listeners = new Set();
  }

  createRoom() {
    if (this.room) {
      this.room.removeAllListeners();
      this.room.disconnect();
    }
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    this.setupListeners();
    return this.room;
  }

  setupListeners() {
    this.room.on(RoomEvent.Connected, () => {
      console.log("LIVEKIT CONNECTED");
      this.notifyListeners();
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log("LIVEKIT DISCONNECTED");
      this.notifyListeners();
    });

    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      console.log("CONNECTION STATE:", state);
      this.notifyListeners();
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log("PARTICIPANT CONNECTED:", participant.identity);
      this.notifyListeners();
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log("PARTICIPANT DISCONNECTED:", participant.identity);
      this.notifyListeners();
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log("TRACK SUBSCRIBED:", participant.identity, track.kind);
      if (track.kind === "audio") {
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
      }
      this.notifyListeners();
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      console.log("TRACK UNSUBSCRIBED:", participant.identity, track.kind);
      track.detach();
      this.notifyListeners();
    });

    this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      console.log("ACTIVE SPEAKERS:", speakers.map(s => s.identity));
      this.notifyListeners();
    });
    
    this.room.on(RoomEvent.LocalTrackPublished, () => {
      this.notifyListeners();
    });
    this.room.on(RoomEvent.LocalTrackUnpublished, () => {
      this.notifyListeners();
    });
  }

  async connect(url, token) {
    if (this.room && this.room.state === 'connected' && this.currentToken === token) {
      return true; // Already connected with this token
    }
    
    this.currentToken = token;

    if (!this.room) {
      this.createRoom();
    }
    
    if (this.room.state === 'connecting') {
      console.warn("Room is already connecting, ignoring duplicate connect call.");
      return true;
    }

    // Disconnect if already connected with a different token
    if (this.room.state === 'connected') {
      await this.room.disconnect();
    }

    try {
      await this.room.connect(url, token);
      return true;
    } catch (err) {
      console.error("LiveKit connection error:", err);
      throw err;
    }
  }

  async disconnect() {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
  }

  async enableMicrophone() {
    if (!this.room || !this.room.localParticipant) {
      throw new Error("Room is not fully connected yet.");
    }
    
    try {
      await this.room.localParticipant.setMicrophoneEnabled(true);
      this.notifyListeners();
    } catch (err) {
      console.error("LIVEKIT PUBLISH ERROR:", err);
      if (err.message && err.message.includes("permission")) {
        throw new Error("Microphone permission denied by browser.");
      }
      throw new Error(`Failed to publish microphone: ${err.message}`);
    }
  }

  async disableMicrophone() {
    if (!this.room || !this.room.localParticipant) return;
    try {
      await this.room.localParticipant.setMicrophoneEnabled(false);
      this.notifyListeners();
    } catch (err) {
      console.error("Failed to disable mic:", err);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  getState() {
    if (!this.room) return null;
    return {
      connectionState: this.room.state,
      participants: Array.from(this.room.remoteParticipants.values()),
      localParticipant: this.room.localParticipant,
      activeSpeakers: this.room.activeSpeakers || [],
      isMicEnabled: this.room.localParticipant?.isMicrophoneEnabled || false
    };
  }
}

const liveKitService = new LiveKitService();
export default liveKitService;

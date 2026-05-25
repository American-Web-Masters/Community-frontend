import apiClient from "./client";

const BASE_URL = "/inner-circle/room";

export const joinInnerCircle = async (roomId) => {
  const response = await apiClient.post(`${BASE_URL}/${roomId}/join`);
  return response.data;
};

export const leaveInnerCircle = async (roomId) => {
  const response = await apiClient.post(`${BASE_URL}/${roomId}/leave`);
  return response.data;
};

export const getInnerCircleState = async (roomId) => {
  const response = await apiClient.get(`${BASE_URL}/${roomId}/state`);
  return response.data;
};

export const requestToSpeak = async (roomId) => {
  const response = await apiClient.post(`${BASE_URL}/${roomId}/request-speak`);
  return response.data;
};

export const withdrawSpeakRequest = async (roomId) => {
  const response = await apiClient.post(`${BASE_URL}/${roomId}/withdraw-speak`);
  return response.data;
};

export const startInnerCircle = async (roomId) => {
  const response = await apiClient.post(`${BASE_URL}/${roomId}/start`);
  return response.data;
};

export const approveSpeaker = async (roomId, targetUserId, targetUserName) => {
  const response = await apiClient.post(
    `${BASE_URL}/${roomId}/approve-speaker`,
    {
      targetUserId,
      targetUserName,
    },
  );
  return response.data;
};

export const demoteSpeaker = async (roomId, targetUserId, targetUserName) => {
  const response = await apiClient.post(
    `${BASE_URL}/${roomId}/demote-speaker`,
    {
      targetUserId,
      targetUserName,
    },
  );
  return response.data;
};

export const getLiveEventsForUser = async () => {
  const response = await apiClient.get("/events/live");
  return response.data;
};

export const endInnerCircle = async (roomId) => {
  const response = await apiClient.post(`${BASE_URL}/${roomId}/end`);
  return response.data;
};


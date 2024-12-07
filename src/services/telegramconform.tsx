import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface StartSessionPayload {
  apiId: string;
  apiHash: string;
}

interface VerifyOTPPayload {
  apiId: string;
  phoneNumber: string;
  phoneHash: string; // เปลี่ยนจาก phoneCodeHash เป็น phoneHash
  otpCode: string;
}

export const startTelegramSession = async (payload: StartSessionPayload) => {
  try {
    const response = await axiosInstance.post(
      '/v1/telegram/start-session',
      payload
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || 'Failed to start Telegram session'
    );
  }
};

export const verifyOTPCode = async (payload: VerifyOTPPayload) => {
  try {
    const response = await axiosInstance.post(
      '/v1/telegram/verify-otp',
      payload
    );
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to verify OTP');
  }
};

export const sendPhoneNumber = async (payload: {
  apiId: string;
  phoneNumber: string;
}) => {
  try {
    const response = await axiosInstance.post(
      '/v1/telegram/send-phone-number',
      payload
    );
    return { hash: response.data.phoneCodeHash }; // เปลี่ยนชื่อ key เป็น hash
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || 'Failed to send phone number'
    );
  }
};

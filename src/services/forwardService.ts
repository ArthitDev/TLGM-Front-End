import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export interface ForwardingStatus {
  id: number;
  status: 'READY' | 'WAITING' | 'ERROR';
  message?: string;
  timestamp?: string;
  successGroups?: string[];
  failedGroups?: string[];
}

// เพิ่ม interface สำหรับ response
export interface ForwardingStatusCheck {
  isActive: boolean;
  messageCount: number;
  isClientConnected: boolean;
  lastMessage?: {
    messageId: string;
    text: string;
    date: Date;
  };
}

// เพิ่มฟังก์ชัน checkForwardingStatus
export const checkForwardingStatus = async (
  userId: string
): Promise<ForwardingStatusCheck> => {
  const response = await axios.post(
    `${API_URL}/api/v1/check-forwarding-status`,
    {
      userId,
    }
  );
  return response.data;
};

export const initializeForwarding = async (userId: string): Promise<void> => {
  await axios.post(`${API_URL}/api/v1/initialize`, { userId });
};

export const startContinuousForward = async (
  userId: string,
  sourceChatId: string,
  destinationChatIds: string[]
): Promise<ForwardingStatus> => {
  const response = await axios.post(
    `${API_URL}/api/v1/start-continuous-forward`,
    {
      userId,
      sourceChatId,
      destinationChatIds,
    }
  );
  return response.data;
};

// ปรับปรุง interface สำหรับ request payload
export interface BeginForwardingRequest {
  userId: string | number;
  sourceChatId: string | number;
  destinationChatIds: (string | number)[];
  interval?: number;
}

export const beginForwarding = async (
  data: BeginForwardingRequest
): Promise<void> => {
  try {
    // ตรวจสอบข้อมูลก่อนส่ง request
    if (!data.userId || !data.sourceChatId || !data.destinationChatIds) {
      throw new Error('Missing required parameters');
    }

    // ตรวจสอบค่า interval
    if (data.interval && (data.interval < 1 || data.interval > 60)) {
      throw new Error('Interval must be between 1 and 60 minutes');
    }

    const response = await axios.post(`${API_URL}/api/v1/begin-forwarding`, {
      userId: data.userId,
      sourceChatId: data.sourceChatId,
      destinationChatIds: Array.isArray(data.destinationChatIds)
        ? data.destinationChatIds
        : [data.destinationChatIds],
      interval: data.interval || 5,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Begin forwarding failed:', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.error || 'Failed to begin forwarding'
      );
    }
    throw error;
  }
};

export const stopContinuousForward = async (userId: string): Promise<void> => {
  await axios.post(`${API_URL}/api/v1/stop-continuous-forward`, { userId });
};

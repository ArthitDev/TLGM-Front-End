import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

interface UserProfileResponse {
  user: {
    userid: number;
    username: string;
    name: string;
    phone: string;
    api_id: number;
    api_hash: string;
    role: number;
  };
}

interface AdminProfileResponse {
  user: {
    userid: number;
    username: string;
    name: string;
    phone: string;
    api_id: number;
    api_hash: string;
    role: number;
  };
}

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/UserProfile`);
  return response.data;
};

export const getAdminProfiles = async (): Promise<AdminProfileResponse> => {
  const response = await axios.get(`${API_URL}/api/v1/AdminProfile`);
  return response.data;
};

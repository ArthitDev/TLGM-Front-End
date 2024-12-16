import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  beginForwarding,
  checkForwardingStatus,
  initializeForwarding,
  startContinuousForward,
  stopContinuousForward,
} from '@/services/forwardService';
import { getUserProfile } from '@/services/profileService';
import {
  getGroupsFromDatabase,
  ResiveGroup,
} from '@/services/ResiveGroupService';
import {
  getSandingGroupsFromDatabase,
  SendingGroup,
} from '@/services/SandingGroupService';

interface ForwardingState {
  status: 'IDLE' | 'INITIALIZED' | 'CHECKING' | 'RUNNING' | 'STOPPED';
  messages: any[];
  error: string | null;
}

const ForwardMessage: React.FC = () => {
  // State Management
  const [sourceGroup, setSourceGroup] = useState<SendingGroup | null>(null);
  const [destinationGroups, setDestinationGroups] = useState<ResiveGroup[]>([]);
  const [interval, setInterval] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [forwardingState, setForwardingState] = useState<ForwardingState>({
    status: 'IDLE',
    messages: [],
    error: null,
  });
  const [lastMessage, setLastMessage] = useState<{
    messageId: string;
    text: string;
    date: Date;
  } | null>(null);

  // 1. Initialize client
  useEffect(() => {
    const initializeClient = async () => {
      try {
        setIsLoading(true);
        const profile = await getUserProfile();
        const userId = profile.user.userid.toString();

        // เริ่มต้นเชื่อมต่อ Telegram Client
        await initializeForwarding(userId);
        setForwardingState((prev) => ({ ...prev, status: 'INITIALIZED' }));

        // ดึงข้อมูลกลุ่ม
        const [sendingGroups, resiveGroups] = await Promise.all([
          getSandingGroupsFromDatabase(userId),
          getGroupsFromDatabase(userId),
        ]);

        if (sendingGroups.length > 0) {
          setSourceGroup(sendingGroups[0]);
        }
        setDestinationGroups(resiveGroups);
      } catch (error) {
        setForwardingState((prev) => ({
          ...prev,
          error: 'ไม่สามารถเริ่มต้นการทำงานได้',
        }));
        toast.error('ไม่สามารถเริ่มต้นการทำงานได้');
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();
  }, []);

  // 2. ตรวจสอบข��อความใหม่
  const handleCheckMessages = async () => {
    if (!sourceGroup?.sg_tid || destinationGroups.length === 0) {
      toast.error('กรุณาเลือกกลุ่มต้นทางและปลายทาง');
      return;
    }

    try {
      setIsLoading(true);
      setForwardingState((prev) => ({ ...prev, status: 'CHECKING' }));

      const profile = await getUserProfile();
      const userId = profile.user.userid.toString();

      const status = await startContinuousForward(
        userId,
        sourceGroup.sg_tid,
        destinationGroups.map((group) => group.rg_tid)
      );

      if (status.status === 'READY') {
        toast.success('พบข้อความใหม่ พร้อมสำหรับการส่งต่อ');
      } else {
        toast('ไม่พบข้อความใหม่ที่จะส่งต่อ');
      }

      setForwardingState((prev) => ({
        ...prev,
        status: status.status === 'READY' ? 'INITIALIZED' : 'IDLE',
      }));
    } catch (error) {
      setForwardingState((prev) => ({
        ...prev,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อความ',
      }));
      toast.error('เกิดข้อผิดพลาดใน��ารตรวจสอบข้อความ');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation
  const validateInputs = (): boolean => {
    if (!sourceGroup?.sg_tid || destinationGroups.length === 0) {
      toast.error('กรุณาเลือกกลุ่มต้นทางและปลายทาง');
      return false;
    }
    if (interval < 1 || interval > 60) {
      toast.error('ระยะเวลาต้องอยู่ระหว่าง 1-60 นาที');
      return false;
    }
    return true;
  };

  // 3. เริ่มส่งข้อความอัตโนมัติ
  const handleStartForwarding = async () => {
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const profile = await getUserProfile();

      await beginForwarding({
        userId: profile.user.userid.toString(),
        sourceChatId: sourceGroup!.sg_tid!,
        destinationChatIds: destinationGroups.map((group) => group.rg_tid!),
        interval,
      });

      setForwardingState((prev) => ({ ...prev, status: 'RUNNING' }));
      toast.success('เริ่มการส่งต่อข้อความอัตโนมัติแล้ว');
    } catch (error) {
      setForwardingState((prev) => ({
        ...prev,
        error: '���กิดข้อผิดพลาดในการส่งต่อข้อความ',
      }));
      toast.error('เกิดข้อผิดพลาดในการส่งต่อข้อความ');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. หยุดการทำงาน
  const handleStopForwarding = async () => {
    try {
      setIsLoading(true);
      const profile = await getUserProfile();
      await stopContinuousForward(profile.user.userid.toString());

      // รีเซ็ตสถานะกลับไปที่ IDLE และล้างข้อความล่าสุด
      setForwardingState((prev) => ({
        ...prev,
        status: 'IDLE',
        messages: [],
        error: null,
      }));
      setLastMessage(null);

      toast.success('หยุดการส่งต่อข้อความแล้ว');
    } catch (error) {
      setForwardingState((prev) => ({
        ...prev,
        error: 'เกิดข้อผิดพลาดในการหยุดการส่งต่อข้อความ',
      }));
      toast.error('เกิดข้อผิดพลาดในการหยุดการส่งต่อข้อความ');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-green-500 animate-pulse';
      case 'STOPPED':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // ปรับปรุง useEffect สำหรัตรวจสอบสถานะ
  useEffect(() => {
    let statusCheckInterval: number;

    const checkStatus = async () => {
      try {
        const profile = await getUserProfile();
        const status = await checkForwardingStatus(
          profile.user.userid.toString()
        );

        if (!status.isActive) {
          setForwardingState((prev) => ({ ...prev, status: 'STOPPED' }));
        }
        if (status.lastMessage) {
          setLastMessage(status.lastMessage);
        }
      } catch (error) {
        toast.error('Error checking status:', error);
      }
    };

    if (forwardingState.status === 'RUNNING') {
      // ตรวจสอบครั้งแรกทันที
      checkStatus();
      // ตั้งเวลาตรวจสอบุก 5 วินาที
      statusCheckInterval = window.setInterval(checkStatus, 5000);
    }

    return () => {
      if (statusCheckInterval) {
        window.clearInterval(statusCheckInterval);
      }
    };
  }, [forwardingState.status]);

  // UI Components
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:py-12 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section with improved styling */}
        <div className="text-center space-y-2 sm:space-y-3 mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wide pb-1">
            Message Forwarding
          </h1>
          <p className="text-base sm:text-lg text-gray-600 tracking-normal mb-4">
            จัดการการส่งต่อข้อความระหว่างกลุ่มแบบอัตโนมัติ
          </p>
        </div>

        {/* Status Card with modern design */}
        <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`h-3 w-3 rounded-full ${getStatusColor(
                  forwardingState.status
                )}`}
              />
              <span className="font-medium text-gray-700">
                สถานะ: {forwardingState.status}
              </span>
            </div>
          </div>

          {/* Last Message Section */}
          {lastMessage && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                ข้อความล่าสุด
              </h4>
              <p className="text-gray-800">{lastMessage.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(lastMessage.date).toLocaleString('th-TH')}
              </p>
            </div>
          )}

          {forwardingState.error && (
            <span className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-full">
              {forwardingState.error}
            </span>
          )}
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Panel: Controls */}
          <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
              ควบคุมการทำงาน
            </h3>

            {/* Interval Setting */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ระยะเวลาตรวจสอบ (นาที)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={interval}
                onChange={(e) =>
                  setInterval(Math.max(1, Number(e.target.value)))
                }
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={forwardingState.status === 'RUNNING'}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col space-y-2 sm:space-y-3">
              {/* ปุ่มตรวจสอบข้อความ - แสดงในสถานะ IDLE */}
              {forwardingState.status === 'IDLE' && (
                <button
                  onClick={handleCheckMessages}
                  disabled={isLoading}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  ตรวจสอบข้อความใหม่
                </button>
              )}

              {/* ปุ่มเริ่มส่งข้อความ - แสดงเมื่อตรวจสอบพบข้อความใหม่ */}
              {forwardingState.status === 'INITIALIZED' && (
                <button
                  onClick={handleStartForwarding}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  เริ่มส่งข้อความ
                </button>
              )}

              {/* ปุ่มหยุดการทำงาน - แสดงเมื่อกำลังส่งข้อความ */}
              {forwardingState.status === 'RUNNING' && (
                <button
                  onClick={handleStopForwarding}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  หยุดการทำงาน
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: Groups Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Source Group */}
            <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                กลุ่มต้นทาง
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">ID กลุ่ม</p>
                  <p className="font-medium text-gray-800">
                    {sourceGroup?.sg_tid || '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">ชื่อกลุ่ม</p>
                  <p className="font-medium text-gray-800">
                    {sourceGroup?.sg_name || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Destination Groups */}
            <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                กลุ่มปลายทาง
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ชื่อกลุ่ม
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID กลุ่ม
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {destinationGroups.map((group) => (
                      <tr key={group.rg_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {group.rg_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {group.rg_tid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessage;

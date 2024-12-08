import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getUserProfile } from '@/services/profileService';
import {
  deleteGroupFromDatabase,
  getChannels,
  getGroupsFromDatabase,
  postGroupToDatabase,
} from '@/services/ResiveGroupService';

interface Channel {
  id: string;
  title: string;
  type: string;
}

interface Group {
  rgId: number;
  userId: number;
  rgName: string;
  rgTid: string;
}

const ResiveGroupPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isFetchingChannels, setIsFetchingChannels] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // ดึงข้อมูลโปรไฟล์ผู้ใช้
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setUserId(profileData.user.userid.toString());
        toast.success('โหลดโปรไฟล์สำเร็จ');
      } catch (error) {
        toast.error('ไม่สามารถโหลดโปรไฟล์ได้');
      }
    };
    fetchUserProfile();
  }, []);

  // ดึงข้อมูลกลุ่ม
  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) {
        toast.error('ไม่พบรหัสผู้ใช้');
        return;
      }

      try {
        const data = await getGroupsFromDatabase(userId);
        const formattedGroups = data.map((group: any) => ({
          rgId: group.rg_id,
          userId: group.userid,
          rgName: group.rg_name,
          rgTid: group.rg_tid,
        }));
        setGroups(formattedGroups || []);
        toast.success('โหลดข้อมูลกลุ่มสำเร็จ');
      } catch (error) {
        toast.error('ไม่สามารถโหลดข้อมูลกลุ่มได้');
      }
    };

    if (userId) fetchGroups();
  }, [userId]);

  // ดึงข้อมูลช่องจาก API
  const fetchChannels = async () => {
    if (!userId) {
      toast.error('ไม่พบรหัสผู้ใช้');
      return;
    }

    setIsFetchingChannels(true);
    try {
      const response = await getChannels(userId);
      setChannels(response.channels || []);
      toast.success('โหลดข้อมูลช่องสำเร็จ');
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลช่องได้');
    } finally {
      setIsFetchingChannels(false);
    }
  };

  // เพิ่มช่องเป็นกลุ่ม
  const handleAddGroup = async (channel: Channel) => {
    if (!userId) {
      toast.error('ไม่พบรหัสผู้ใช้');
      return;
    }

    try {
      const newGroup = await postGroupToDatabase(
        userId,
        channel.title,
        channel.id
      );
      toast.success('เพิ่มกลุ่มสำเร็จ');
      setGroups((prevGroups) => [
        ...prevGroups,
        {
          rgId: newGroup.groupId,
          userId: parseInt(userId, 10),
          rgName: channel.title,
          rgTid: channel.id,
        },
      ]);
    } catch (error: any) {
      // ตรวจสอบ error.response
      if (error.response?.data?.errorCode) {
        switch (error.response.data.errorCode) {
          case 'DUPLICATE_RG_TID':
            toast.error('กลุ่มนี้มีอยู่ในระบบแล้ว');
            break;
          case 'CONFLICT_WITH_SENDINGGROUP':
            toast.error('กลุ่มนี้ซ้ำกับข้อมูลในตาราง sendinggroup');
            break;
          case 'MISSING_FIELDS':
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            break;
          default:
            toast.error(error.response.data.message || 'เกิดข้อผิดพลาด');
        }
      } else {
        toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      }
    }
  };

  // เปิด Modal ยืนยันการลบ
  const openDeleteModal = (group: Group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  // ปิด Modal ยืนยันการลบ
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  // ลบกลุ่ม
  const handleDeleteGroup = async () => {
    if (!selectedGroup || !userId) return;

    try {
      await deleteGroupFromDatabase(selectedGroup.rgId.toString(), userId);
      toast.success('ลบกลุ่มสำเร็จ');
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group.rgId !== selectedGroup.rgId)
      );
    } catch (error) {
      toast.error('ไม่สามารถลบกลุ่มได้');
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        จัดการกลุ่มต้นและปลายทาง
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ส่วนของช่อง */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">สแกน</h2>
            <button
              onClick={fetchChannels}
              disabled={isFetchingChannels}
              className={`py-2 px-6 rounded-lg text-white font-medium ${
                isFetchingChannels
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isFetchingChannels ? 'กำลังโหลด...' : 'สแกน'}
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase border-b">
                    รหัสช่อง
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase border-b">
                    ชื่อช่อง
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase border-b">
                    การกระทำ
                  </th>
                </tr>
              </thead>
              <tbody>
                {channels.length > 0 ? (
                  channels.map((channel, index) => (
                    <tr
                      key={channel.id}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-gray-100`}
                    >
                      <td className="px-6 py-4 text-gray-700 border-b">
                        {channel.id}
                      </td>
                      <td className="px-6 py-4 text-gray-700 border-b">
                        {channel.title}
                      </td>
                      <td className="px-6 py-4 text-gray-700 border-b">
                        <button
                          onClick={() => handleAddGroup(channel)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          เพิ่ม
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-gray-500 border-b"
                    >
                      ไม่พบข้อมูลช่อง
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ส่วนของกลุ่ม */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            จัดการกลุ่มปลายทาง
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase border-b">
                    รหัสกลุ่ม
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase border-b">
                    ชื่อกลุ่ม
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase border-b">
                    การกระทำ
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.length > 0 ? (
                  groups.map((group, index) => (
                    <tr
                      key={group.rgId}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-gray-100`}
                    >
                      <td className="px-6 py-4 text-gray-700 border-b">
                        {group.rgTid}
                      </td>
                      <td className="px-6 py-4 text-gray-700 border-b">
                        {group.rgName}
                      </td>
                      <td className="px-6 py-4 text-gray-700 border-b">
                        <button
                          onClick={() => openDeleteModal(group)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-gray-500 border-b"
                    >
                      ไม่พบข้อมูลกลุ่ม
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal ยืนยันการลบ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeDeleteModal}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl">
            <div className="p-8">
              <div className="text-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-16 w-16 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
                  ยืนยันการลบ
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  คุณต้องการลบกลุ่ม{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {selectedGroup?.rgName}
                  </span>{' '}
                  ใช่หรือไม่? <br />
                  การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 
                  rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                  onClick={closeDeleteModal}
                >
                  ยกเลิก
                </button>
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600
                  rounded-2xl transition-all duration-200 font-medium"
                  onClick={handleDeleteGroup}
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResiveGroupPage;

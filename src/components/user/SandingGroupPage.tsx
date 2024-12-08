import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getUserProfile } from '@/services/profileService';
import { getChannels } from '@/services/ResiveGroupService';
import {
  deleteSandingGroupFromDatabase,
  getSandingGroupsFromDatabase,
  postSandingGroupToDatabase,
} from '@/services/SandingGroupService';

interface Channel {
  id: string;
  title: string;
  type: string;
}

interface SendingGroup {
  sg_id: number;
  userid: number;
  sg_name: string;
  message: string;
  sg_tid?: string;
}

const SandingGroupPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [groups, setGroups] = useState<SendingGroup[]>([]);
  const [isFetchingChannels, setIsFetchingChannels] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SendingGroup | null>(null);

  // Fetch user profile to get userId
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

  // Fetch sending groups from the database
  useEffect(() => {
    const fetchGroups = async () => {
      if (!userId) {
        toast.error('ไม่พบรหัสผู้ใช้');
        return;
      }

      try {
        const data = await getSandingGroupsFromDatabase(userId);
        setGroups(data || []);
        toast.success('โหลดข้อมูลกลุ่มต้นทางสำเร็จ');
      } catch (error: any) {
        toast.error(error.message || 'ไม่สามารถโหลดข้อมูลกลุ่มได้');
      }
    };

    if (userId) fetchGroups();
  }, [userId]);

  // Fetch channels from API
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

  // Add a new group
  const handleAddGroup = async (channel: Channel) => {
    if (!userId) {
      toast.error('ไม่พบรหัสผู้ใช้');
      return;
    }

    try {
      const newGroup = await postSandingGroupToDatabase(
        userId,
        channel.title,
        'ข้อความเริ่มต้น', // Replace with actual message if needed
        channel.id
      );
      toast.success('เพิ่มกลุ่มสำเร็จ');
      setGroups((prevGroups) => [
        ...prevGroups,
        {
          sg_id: newGroup.groupId,
          userid: parseInt(userId, 10),
          sg_name: channel.title,
          message: 'ข้อความเริ่มต้น', // Replace with actual message if needed
          sg_tid: channel.id,
        },
      ]);
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถเพิ่มกลุ่มได้');
    }
  };

  // Open modal to confirm deletion
  const openDeleteModal = (group: SendingGroup) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  // Close deletion confirmation modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  // Delete a group
  const handleDeleteGroup = async () => {
    if (!selectedGroup || !userId) return;

    try {
      await deleteSandingGroupFromDatabase(
        selectedGroup.sg_id.toString(),
        userId
      );
      toast.success('ลบกลุ่มสำเร็จ');
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group.sg_id !== selectedGroup.sg_id)
      );
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถลบกลุ่มได้');
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        จัดการกลุ่มต้นทาง
      </h1>

      {/* Flexbox for Layout */}
      <div className="flex flex-wrap gap-6">
        {/* Section for Channels */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex-1">
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

        {/* Section for Sending Groups */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex-1">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            จัดการกลุ่มต้นทาง
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
                    ข้อความ
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
                      key={group.sg_id}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-gray-100`}
                    >
                      <td className="px-6 py-4 text-gray-700 border-b">
                        {group.sg_tid}
                      </td>
                      <td className="px-6 py-4 text-gray-700 border-b">
                        {group.sg_name}
                      </td>
                      <td className="px-6 py-4 text-gray-700 border-b">
                        {group.message}
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
                      colSpan={4}
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

      {/* Modal for confirming deletion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeDeleteModal}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl">
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
                  ยืนยันการลบ
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  คุณต้องการลบกลุ่ม{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {selectedGroup?.sg_name}
                  </span>{' '}
                  ใช่หรือไม่?
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={closeDeleteModal}
                >
                  ยกเลิก
                </button>
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-2xl"
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

export default SandingGroupPage;

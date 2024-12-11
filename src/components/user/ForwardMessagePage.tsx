import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

const ForwardMessage: React.FC = () => {
  const [sourceGroup] = useState('12345678'); // ตัวอย่าง ID กลุ่มต้นทาง
  const [messagePreview] = useState('นี่คือข้อความที่ต้องการส่งต่อ');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [currentLog, setCurrentLog] = useState<any | null>(null); // เก็บสถานะการส่งรอบล่าสุด
  const [sendCount, setSendCount] = useState(0);

  const destinationGroups = [
    { id: 23456789, name: 'กลุ่ม 1' },
    { id: 34567890, name: 'กลุ่ม 2' },
    { id: 45678901, name: 'กลุ่ม 3' },
  ];

  const handleSelectGroup = (groupId: number) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectAll = () => {
    setSelectedGroups(destinationGroups.map((group) => group.id));
  };

  const handleDeselectAll = () => {
    setSelectedGroups([]);
  };

  const handleManualForward = () => {
    if (selectedGroups.length === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 กลุ่มที่ต้องการส่งข้อความ');
      return;
    }

    const successGroups = selectedGroups.filter((id) => id !== 34567890); // จำลองผลการส่ง
    const failedGroups = selectedGroups.filter((id) => id === 34567890);

    const newLog = {
      id: sendCount + 1, // รอบที่ส่ง
      successGroups,
      failedGroups,
      timestamp: new Date().toLocaleString('th-TH', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }),
    };

    setCurrentLog(newLog); // แสดงสถานะรอบล่าสุดเท่านั้น
    setSendCount((prev) => prev + 1);
    alert('ส่งข้อความเสร็จเรียบร้อยแล้ว');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold text-center mb-6">ส่งข้อความต่อ</h1>

      {/* Source Group Section */}
      <div className="mb-6">
        <h2 className="text-lg font-medium">กลุ่มต้นทาง</h2>
        <p className="text-gray-700">
          <strong>ID กลุ่ม:</strong> {sourceGroup}
        </p>
        <p className="text-gray-700">
          <strong>ข้อความ:</strong> {messagePreview}
        </p>
      </div>

      {/* Destination Groups Section */}
      <div className="mb-6">
        <h2 className="text-lg font-medium">เลือกกลุ่มปลายทาง</h2>
        <div className="flex gap-4 mb-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            onClick={handleSelectAll}
          >
            <CheckCircleIcon className="h-5 w-5" />
            เลือกทั้งหมด
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
            onClick={handleDeselectAll}
          >
            <XCircleIcon className="h-5 w-5" />
            ยกเลิกทั้งหมด
          </button>
        </div>
        <ul className="space-y-2">
          {destinationGroups.map((group) => (
            <li key={group.id} className="flex items-center">
              <input
                type="checkbox"
                id={`group-${group.id}`}
                checked={selectedGroups.includes(group.id)}
                onChange={() => handleSelectGroup(group.id)}
                className="mr-2"
              />
              <label htmlFor={`group-${group.id}`} className="text-gray-700">
                {group.name} (ID: {group.id})
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Message Status Section */}
      {currentLog && (
        <section className="mb-8">
          <h2 className="text-lg font-medium">สถานะการส่งข้อความ</h2>
          <div className="bg-white p-4 rounded-md shadow">
            <p className="text-gray-700">
              <strong>รอบที่:</strong> {currentLog.id} | <strong>เวลา:</strong>{' '}
              {currentLog.timestamp}
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="font-semibold">กลุ่มที่สำเร็จ:</span>{' '}
                {currentLog.successGroups.length > 0
                  ? currentLog.successGroups.join(', ')
                  : 'ไม่มี'}
              </li>
              <li className="flex items-center gap-2">
                <XCircleIcon className="h-5 w-5 text-red-500" />
                <span className="font-semibold">กลุ่มที่ล้มเหลว:</span>{' '}
                {currentLog.failedGroups.length > 0
                  ? currentLog.failedGroups.join(', ')
                  : 'ไม่มี'}
              </li>
            </ul>
          </div>
        </section>
      )}

      {/* Control Panel Section */}
      <div className="text-center">
        <button
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          onClick={handleManualForward}
        >
          <CheckCircleIcon className="h-5 w-5" />
          ส่งข้อความ
        </button>
      </div>
    </div>
  );
};

export default ForwardMessage;

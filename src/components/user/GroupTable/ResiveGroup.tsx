import React from 'react';

interface Group {
  rgId: number;
  userId: number;
  rgName: string;
  rgTid: string;
}

interface Channel {
  id: string;
  title: string;
  type: string;
}

interface ResiveGroupProps {
  groups: Group[];
  onAddGroup: (channel: Channel) => void;
  onDeleteGroup: (group: Group) => void;
}

const ResiveGroup: React.FC<ResiveGroupProps> = ({ groups, onDeleteGroup }) => {
  return (
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
                      onClick={() => onDeleteGroup(group)}
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
  );
};

export default ResiveGroup;

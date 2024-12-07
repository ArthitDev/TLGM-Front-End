import React, { useState } from 'react';

import {
  sendPhoneNumber,
  startTelegramSession,
  verifyOTPCode,
} from '@/services/telegramconform';

const TelegramConform: React.FC = () => {
  const [apiId, setApiId] = useState<string>('');
  const [apiHash, setApiHash] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [phoneHash, setPhoneHash] = useState<string>(''); // เปลี่ยนชื่อจาก phoneCodeHash
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string>('');

  const handleSubmitAPI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await startTelegramSession({ apiId, apiHash });
      setStep(2);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error occurred while starting session.');
    }
  };

  const handleSubmitPhone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { hash } = await sendPhoneNumber({ apiId, phoneNumber }); // เปลี่ยนจาก phoneCodeHash เป็น hash
      setPhoneHash(hash); // ใช้ชื่อ state เป็น phoneHash
      setStep(3);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error occurred while sending phone number.');
    }
  };

  const handleSubmitOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await verifyOTPCode({ apiId, phoneNumber, otpCode, phoneHash }); // ใช้ phoneHash แทน phoneCodeHash
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error occurred while verifying OTP.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      {error && <p className="text-red-500">{error}</p>}
      {step === 1 && (
        <form onSubmit={handleSubmitAPI}>
          <div className="mb-4">
            <label
              htmlFor="apiId"
              className="block text-sm font-medium text-gray-700"
            >
              API ID:
            </label>
            <input
              type="text"
              id="apiId"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="apiHash"
              className="block text-sm font-medium text-gray-700"
            >
              API Hash:
            </label>
            <input
              type="text"
              id="apiHash"
              value={apiHash}
              onChange={(e) => setApiHash(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ถัดไป
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleSubmitPhone}>
          <div className="mb-4">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              เบอร์โทรศัพท์:
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="+66812345678"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ส่งรหัส OTP
          </button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleSubmitOTP}>
          <div className="mb-4">
            <label
              htmlFor="otpCode"
              className="block text-sm font-medium text-gray-700"
            >
              รหัส OTP:
            </label>
            <input
              type="text"
              id="otpCode"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ยืนยัน OTP
          </button>
        </form>
      )}
    </div>
  );
};

export default TelegramConform;

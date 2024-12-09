import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { getUserProfile } from '@/services/profileService';
import { sendPhone, startClient, verifyCode } from '@/services/tlg_confrm';

const UserTelegramSettings = () => {
  const [step, setStep] = useState(0); // Step 0: API Info, 1: Phone, 2: OTP
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      apiId: '',
      apiHash: '',
      phoneNumber: '',
      otpCode: '',
      userid: '',
    },
  });

  type FormData = {
    apiId: string;
    apiHash: string;
    phoneNumber: string;
    otpCode: string;
    userid: string; // เพิ่ม userid
  };

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = methods;

  // ดึงข้อมูล `apiId` และ `apiHash` จาก `getUserProfile`
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getUserProfile();
        setValue('apiId', profileData.user.api_id.toString());
        setValue('apiHash', profileData.user.api_hash);
        setValue('phoneNumber', profileData.user.phone);
        setValue('userid', profileData.user.userid.toString()); // เพิ่ม userid
        toast.success('Loaded API information.');
      } catch (error) {
        toast.error('Failed to load API information.');
      }
    };

    fetchProfileData();
  }, [setValue]);

  // Step 0: เริ่มต้น Client
  const handleStartClient = async (data: FormData) => {
    try {
      await startClient(data.apiId, data.apiHash);
      toast.success('Client started successfully!');
      setStep(1); // ไปที่ขั้นตอนถัดไป
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start client');
    }
  };

  // Step 1: ส่งเบอร์โทรศัพท์
  const handleSendPhone = async (data: FormData) => {
    try {
      const response = await sendPhone(data.apiId, data.phoneNumber);
      setPhoneCodeHash(response.phoneCodeHash);
      setStep(2);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  // Step 2: ยืนยัน OTP
  const handleVerifyOTP = async (data: FormData) => {
    try {
      await verifyCode(
        data.apiId,
        data.phoneNumber,
        data.otpCode,
        phoneCodeHash,
        data.userid // ส่ง userid ไปด้วย
      );
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to verify OTP');
    }
  };

  const handleStepSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (step === 0) {
        await handleStartClient(data);
      } else if (step === 1) {
        await handleSendPhone(data);
      } else if (step === 2) {
        await handleVerifyOTP(data);
      }
    } catch (error) {
      toast.error('Error in handleStepSubmit.');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (step === 0) return 'Start Client';
    if (step === 1) return 'Send OTP';
    if (step === 2) return 'Verify OTP';
    return '';
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit(handleStepSubmit)}>
          {step === 0 && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="apiId"
                  className="block text-sm font-medium text-gray-700"
                >
                  API ID:
                </label>
                <input
                  {...register('apiId', { required: 'API ID is required' })}
                  id="apiId"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  readOnly
                />
                {errors.apiId && (
                  <p className="text-red-500 text-sm">{errors.apiId.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="apiHash"
                  className="block text-sm font-medium text-gray-700"
                >
                  API Hash:
                </label>
                <input
                  {...register('apiHash', {
                    required: 'API Hash is required',
                  })}
                  id="apiHash"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  readOnly
                />
                {errors.apiHash && (
                  <p className="text-red-500 text-sm">
                    {errors.apiHash.message}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <div className="mb-4">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number:
              </label>
              <input
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                })}
                id="phoneNumber"
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="mb-4">
              <label
                htmlFor="otpCode"
                className="block text-sm font-medium text-gray-700"
              >
                OTP Code:
              </label>
              <input
                {...register('otpCode', { required: 'OTP Code is required' })}
                id="otpCode"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.otpCode && (
                <p className="text-red-500 text-sm">{errors.otpCode.message}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Processing...' : getButtonLabel()}
          </button>
        </form>
      </div>
    </FormProvider>
  );
};

export default UserTelegramSettings;

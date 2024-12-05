import { Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

/// หน้า Error หรือ 404 เพิ่มเนื้อหาเมื่อไม่เจอหน้าของเว็บ จะมีปุ่มกลับไปหน้าหลัก และ Resirect ไปเองได้ 10 วิ
export default function Custom404() {
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        // กลับไปยังหน้าหลักเมื่อนับถอยหลังครบ
        clearInterval(intervalId);
        router.push('/');
      }
    }, 1000);

    // เคลียเวลาของฟังก์ชั่นนับถอยหลัง
    return () => clearInterval(intervalId);
  }, [countdown, router]);

  return (
    <div style={{ textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom paddingTop={3}>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" paragraph>
        Sorry, the page you are looking for does not exist.
      </Typography>
      <Link href="/" passHref>
        <Button variant="contained" color="primary">
          Go back to homepage
        </Button>
      </Link>
      <Typography variant="body2" paragraph pt={5}>
        {countdown > 0
          ? `Auto redirecting in ${countdown} seconds...`
          : 'Redirecting now...'}
      </Typography>
    </div>
  );
}

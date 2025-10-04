import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../Utils/firebaseClient';
import { EmailTemplates } from '../../Email/';

export function useVerification() {
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedVerificationCode, setExpectedVerificationCode] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer for verification code expiry
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft]);

  const sendVerificationCode = async (email: string, onError: (msg: string) => void, onSuccess: () => void) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onError('Please enter a valid email address first.');
      return;
    }

    setSendingVerification(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedVerificationCode(code);
      setTimeLeft(600); // 10 minutes

      const expiresAt = Date.now() + 10 * 60 * 1000;
      const addDocPromise = addDoc(collection(db, 'verification_codes'), {
        email,
        code,
        createdAt: serverTimestamp(),
        expiresAt,
        used: false
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      );
      try {
        await Promise.race([addDocPromise, timeoutPromise]);
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue without storing, code will still be sent
      }

      // Send verification email
      const htmlBody = EmailTemplates.getVerificationCodeHtml(code);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const fetchPromise = fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Email Verification - MJ2 Studios',
            body: htmlBody
          }),
          signal: controller.signal,
        });
        await fetchPromise;
      } finally {
        clearTimeout(timeoutId);
      }

      console.log('Verification code generated and email sent:', code);
      onSuccess();
    } catch (error) {
      console.error('Verification code generation error:', error);
      let errorMsg = 'Failed to send verification code. Please try again.';
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('Timeout')) {
          errorMsg = 'Request timed out. Please check your connection and try again.';
        }
      }
      onError(errorMsg);
    } finally {
      setSendingVerification(false);
    }
  };

  const verifyCode = async (email: string, code: string, onError: (msg: string) => void, onSuccess: () => void) => {
    if (!code.trim()) {
      onError('Please enter the verification code.');
      return;
    }

    setVerifyingCode(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const now = Date.now();
      const q = query(collection(db, 'verification_codes'), where('email', '==', email), where('code', '==', code), where('used', '==', false));
      const getDocsPromise = getDocs(q);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      );
      const snapshot = await Promise.race([getDocsPromise, timeoutPromise]);

      if (snapshot.empty) {
        onError('Invalid verification code.');
      } else {
        const data = snapshot.docs[0].data();
        if (data.expiresAt <= now) {
          onError('Verification code has expired.');
        } else {
          const docRef = doc(db, 'verification_codes', snapshot.docs[0].id);
          const updatePromise = updateDoc(docRef, { used: true });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Update timeout')), 5000)
          );
          try {
            await Promise.race([updatePromise, timeoutPromise]);
          } catch (updateError) {
            console.error('Update error:', updateError);
            // Still verify since code was correct
          }
          setEmailVerified(true);
          onSuccess();
        }
      }
    } catch (dbError) {
      console.error('Database verification error:', dbError);
      // If database fails, check against expected code
      if (code === expectedVerificationCode) {
        setEmailVerified(true);
        onSuccess();
      } else {
        onError('Invalid verification code.');
      }
    }
    setVerifyingCode(false);
  };

  return {
    verificationCode,
    setVerificationCode,
    expectedVerificationCode,
    emailVerified,
    sendingVerification,
    verifyingCode,
    timeLeft,
    setTimeLeft,
    sendVerificationCode,
    verifyCode
  };
}
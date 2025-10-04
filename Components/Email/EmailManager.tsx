'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../Utils/firebaseClient';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { EmailService } from './services';
import { Email, EmailForm } from './types';

const EmailManager: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [form, setForm] = useState<EmailForm>({ to: '', subject: '', body: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    const querySnapshot = await getDocs(collection(db, 'emails'));
    const emailsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Email));
    setEmails(emailsData);
  };

  const handleSave = async () => {
    if (!form.to || !form.subject || !form.body) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'emails'), {
        ...form,
        sent: false,
        createdAt: new Date(),
      });
      setForm({ to: '', subject: '', body: '' });
      loadEmails();
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (email: Email) => {
    if (!email.id) return;
    setLoading(true);
    try {
      const success = await EmailService.sendEmailLegacy(email);
      if (success) {
        await updateDoc(doc(db, 'emails', email.id), { sent: true });
        loadEmails();
      } else {
        console.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'emails', id));
    loadEmails();
  };

  return (
    <div className="email-system">
      <h2>Email System</h2>
      <div className="compose-email">
        <input
          type="email"
          placeholder="To"
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
        />
        <input
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <textarea
          placeholder="Body"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
        <button onClick={handleSave} disabled={loading}>Save Email</button>
      </div>
      <div className="email-list">
        <h3>Stored Emails</h3>
        {emails.map((email) => (
          <div key={email.id} className="email-item">
            <p><strong>To:</strong> {email.to}</p>
            <p><strong>Subject:</strong> {email.subject}</p>
            <p><strong>Body:</strong> {email.body}</p>
            <p><strong>Sent:</strong> {email.sent ? 'Yes' : 'No'}</p>
            <button onClick={() => handleSend(email)} disabled={loading || email.sent}>Send</button>
            <button onClick={() => handleDelete(email.id!)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailManager;
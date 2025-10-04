import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('API route called with request');
    const { to, subject, body }: { to: string; subject: string; body: string } = await request.json();
    console.log('Request parsed:', { to, subject, bodyLength: body.length });

    // Check environment variables
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);

    // Send email using Resend with timeout
    const sendPromise = resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html: body,
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Email send timeout')), 8000)
    );
    const { data, error } = await Promise.race([sendPromise, timeoutPromise]);

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
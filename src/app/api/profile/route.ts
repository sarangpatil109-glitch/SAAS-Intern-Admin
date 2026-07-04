import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const upi_id = formData.get('upi_id') as string || null;
    const account_holder_name = formData.get('account_holder_name') as string || null;
    const bank_name = formData.get('bank_name') as string || null;
    const account_number = formData.get('account_number') as string || null;
    const ifsc_code = formData.get('ifsc_code') as string || null;
    const file = formData.get('payment_qr_image') as File | null;

    if (!name || !phone || !email) {
      return NextResponse.json({ error: 'Name, Phone and Email are required' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (phone && (!/^\+?[\d\s\-()]+$/.test(phone) || phone.length < 7)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    if (upi_id && !/^[\w.-]+@[\w.-]+$/.test(upi_id)) {
      return NextResponse.json({ error: 'Invalid UPI ID format' }, { status: 400 });
    }

    if (ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code)) {
      return NextResponse.json({ error: 'Invalid IFSC code format' }, { status: 400 });
    }

    let payment_qr_image = undefined;

    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        return NextResponse.json({ error: 'QR Code must be a JPG or PNG image' }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size must be less than 5MB' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);
      payment_qr_image = `/uploads/${filename}`;
    }

    const dataToUpdate: any = {
      name,
      phone,
      email,
      upi_id,
      account_holder_name,
      bank_name,
      account_number,
      ifsc_code,
    };

    if (payment_qr_image !== undefined) {
      dataToUpdate.payment_qr_image = payment_qr_image;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id as number },
      data: dataToUpdate
    });

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

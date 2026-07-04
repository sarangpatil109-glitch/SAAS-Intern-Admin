import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, phone, email, password, role } = await request.json();

    if (role === 'Admin') {
      return NextResponse.json({ error: 'Cannot create Admin accounts.' }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const lastUser = await prisma.user.findFirst({
      where: { role: 'Sales Executive' },
      orderBy: { sales_id: 'desc' }
    });

    let newSalesId = 'SA0001';
    if (lastUser && lastUser.sales_id.startsWith('SA')) {
      const numStr = lastUser.sales_id.replace('SA', '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num)) {
        newSalesId = `SA${String(num + 1).padStart(4, '0')}`;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        sales_id: newSalesId,
        name,
        phone,
        email,
        password: hashedPassword,
        role: 'Sales Executive',
        status: 'Active'
      }
    });

    return NextResponse.json({ message: 'User registered successfully', sales_id: newSalesId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

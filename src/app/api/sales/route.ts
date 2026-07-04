import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Sales Executive') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id as number } });
    if (!user || user.status === 'Blocked') {
      return NextResponse.json({ error: 'Your account is blocked. Cannot submit sales.' }, { status: 403 });
    }

    const formData = await request.formData();
    const customer_name = formData.get('customer_name') as string;
    const customer_phone = formData.get('customer_phone') as string;
    const customer_email = formData.get('customer_email') as string;
    const product_id_str = formData.get('product_id') as string;
    const remarks = formData.get('remarks') as string || null;
    const file = formData.get('payment_screenshot') as File;

    if (!customer_name || !customer_phone || !customer_email || !product_id_str || !file) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    
    const product_id = parseInt(product_id_str, 10);
    if (isNaN(product_id)) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Payment screenshot must be an image' }, { status: 400 });
    }

    // Phone format basic validation
    if (!/^\+?[\d\s\-()]+$/.test(customer_phone) || customer_phone.length < 7) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Email format basic validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Secure filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);
    const payment_screenshot = `/uploads/${filename}`;

    const sale = await prisma.sale.create({
      data: {
        sales_executive_id: session.id as number,
        customer_name,
        customer_phone,
        customer_email,
        product_id,
        payment_screenshot,
        remarks,
        status: 'Pending'
      }
    });

    return NextResponse.json({ message: 'Sale submitted successfully', sale }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sales = await prisma.sale.findMany({
      where: { sales_executive_id: session.id as number },
      orderBy: { created_at: 'desc' },
      include: { commission: true }
    });

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, status } = await request.json();
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check duplicate ignoring case
    const allProducts = await prisma.product.findMany({ select: { name: true } });
    const isDuplicate = allProducts.some(p => p.name.toLowerCase() === name.trim().toLowerCase());
    
    if (isDuplicate) {
      return NextResponse.json({ error: 'A product with this name already exists' }, { status: 400 });
    }

    // Default commission setting creation is handled transactionally
    const product = await prisma.$transaction(async (tx) => {
      const newProd = await tx.product.create({
        data: { name: name.trim(), status }
      });
      await tx.commissionSetting.create({
        data: {
          product_id: newProd.id,
          commission_amount: 0 // Default 0
        }
      });
      return newProd;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

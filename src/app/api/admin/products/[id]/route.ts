import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const productId = parseInt(params.id, 10);
    const { name, status } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check duplicate ignoring case (excluding current product)
    const allProducts = await prisma.product.findMany({ select: { id: true, name: true } });
    const isDuplicate = allProducts.some(p => p.id !== productId && p.name.toLowerCase() === name.trim().toLowerCase());
    
    if (isDuplicate) {
      return NextResponse.json({ error: 'A product with this name already exists' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { name: name.trim(), status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const productId = parseInt(params.id, 10);

    // Check if linked to any sales
    const count = await prisma.sale.count({
      where: { product_id: productId }
    });

    if (count > 0) {
      return NextResponse.json({ error: 'Cannot delete product because it is linked to existing sales' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.commissionSetting.deleteMany({ where: { product_id: productId } }),
      prisma.product.delete({ where: { id: productId } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

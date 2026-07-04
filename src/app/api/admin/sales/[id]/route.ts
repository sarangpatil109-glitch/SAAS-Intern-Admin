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
    const saleId = parseInt(params.id, 10);
    if (isNaN(saleId)) return NextResponse.json({ error: 'Invalid sale ID' }, { status: 400 });

    const { status } = await request.json();
    if (!['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const sale = await prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    if (sale.status === 'Approved' || sale.status === 'Rejected') {
      return NextResponse.json({ error: `Sale is already ${sale.status}` }, { status: 400 });
    }

    // Transaction for atomic update and commission creation
    const updatedSale = await prisma.$transaction(async (tx) => {
      const updated = await tx.sale.update({
        where: { id: saleId },
        data: { status }
      });

      if (status === 'Approved') {
        const setting = await tx.commissionSetting.findUnique({
          where: { product_id: sale.product_id }
        });

        if (setting) {
          // Check for existing commission to prevent duplicates
          const existing = await tx.commission.findUnique({
            where: { sale_id: saleId }
          });

          if (!existing) {
            await tx.commission.create({
              data: {
                sale_id: saleId,
                sales_executive_id: sale.sales_executive_id,
                product_id: sale.product_id,
                commission_amount: setting.commission_amount
              }
            });
          }
        }
      }

      return updated;
    });

    return NextResponse.json({ message: `Sale ${status} successfully`, sale: updatedSale });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import prisma from '@/lib/prisma'

export const getTotalRevenue = async () => {
   const revenue = await prisma.orderItem.aggregate({
      _sum: { price: true },
      where: { order: { isPaid: true } },
   })

   return revenue._sum.price ?? 0
}

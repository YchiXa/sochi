import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const {
         title,
         description,
         images,
         keywords,
         metadata,
         price,
         discount,
         stock,
         brandId,
         categoryId,
         isFeatured,
         isAvailable,
         isPhysical,
      } = await req.json()

      if (!title) {
         return new NextResponse('Title is required', { status: 400 })
      }

      if (!brandId) {
         return new NextResponse('Brand id is required', { status: 400 })
      }

      if (!categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const product = await prisma.product.create({
         data: {
            title,
            description,
            images,
            keywords,
            metadata,
            price,
            discount,
            stock,
            isPhysical,
            isFeatured,
            isAvailable,
            brand: {
               connect: { id: brandId },
            },
            categories: {
               connect: { id: categoryId },
            },
         },
         include: {
            brand: true,
            categories: true,
         },
      })

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCTS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

   if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
   }

   const { searchParams } = new URL(req.url)
   const categoryId = searchParams.get('categoryId') || undefined
   const isFeatured = searchParams.get('isFeatured')

   const where: any = {}

   if (categoryId) {
      where.categories = {
         some: {
            id: categoryId,
         },
      }
   }

   if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true'
   }

   const products = await prisma.product.findMany({
      where,
      include: {
         brand: true,
         categories: true,
      },
   })

   return NextResponse.json(products)
   } catch (error) {
      console.error('[PRODUCTS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

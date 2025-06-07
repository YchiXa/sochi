import { signJWT } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import { getErrorResponse } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
   try {
      const expiryMinutes = 30 * 24 * 60

      let { email, OTP } = await req.json()

      email = email.toString().toLowerCase()

      if (!process.env.JWT_SECRET_KEY) {
         console.error('JWT secret key is missing')
         return getErrorResponse(500, 'Internal Server Error')
      }

      const user = await prisma.owner.findFirstOrThrow({
         where: { email },
      })

      const isValid = await bcrypt.compare(OTP, user.OTP ?? '')
      if (!isValid) {
         return getErrorResponse(400, 'Invalid verification code')
      }

      await prisma.owner.update({
         where: { id: user.id },
         data: { OTP: null },
      })

      const token = await signJWT(
         { sub: user.id },
         { exp: `${expiryMinutes}m` }
      )

      const tokenMaxAge = expiryMinutes * 60
      const cookieOptions = {
         name: 'token',
         value: token,
         httpOnly: true,
         path: '/',
         secure: process.env.NODE_ENV !== 'development',
         maxAge: tokenMaxAge,
         sameSite: 'lax' as const,
      }

      const response = new NextResponse(
         JSON.stringify({
            status: 'success',
            token,
         }),
         {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
         }
      )

      await Promise.all([
         response.cookies.set(cookieOptions),
         response.cookies.set({
            name: 'logged-in',
            value: 'true',
            maxAge: tokenMaxAge,
         }),
      ])

      return response
   } catch (error: any) {
      if (error instanceof ZodError) {
         return getErrorResponse(400, 'failed validations', error)
      }

      return getErrorResponse(500, error.message)
   }
}

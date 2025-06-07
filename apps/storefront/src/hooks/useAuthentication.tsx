'use client'

import { validateBoolean } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function useAuthenticated() {
   const [authenticated, setAuthenticated] = useState(null)

   useEffect(() => {
      try {
         if (typeof window !== 'undefined' && window.localStorage) {
            const cookies = Object.fromEntries(
               document.cookie
                  .split('; ')
                  .map((c) => {
                     const [k, v] = c.split('=')
                     return [k, v]
                  })
            )
            setAuthenticated(cookies['logged-in'] === 'true')
         }
      } catch (error) {
         console.error({ error })
      }
   }, [])

   return { authenticated: validateBoolean(authenticated, true) }
}

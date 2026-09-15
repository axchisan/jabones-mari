'use client'

import { createAuthClient } from 'better-auth/react'
import {
  adminClient,
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins'
import type { auth } from '@/lib/auth/servidor'

export const clienteAuth = createAuthClient({
  plugins: [adminClient(), emailOTPClient(), inferAdditionalFields<typeof auth>()],
})

export const { signIn, signUp, signOut, useSession } = clienteAuth

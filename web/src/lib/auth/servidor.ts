import 'server-only'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { admin as pluginAdmin } from 'better-auth/plugins'
import { emailOTP } from 'better-auth/plugins/email-otp'
import { enviarCodigo, type TipoCodigo } from '@/lib/notificaciones/correo-codigo'
import { db, esquema } from '@/lib/db/cliente'
import { SITIO_URL } from '@/lib/config'

/** Roles del negocio. 'admin' entra al panel; 'cliente' solo a su cuenta. */
export const ROLES = ['cliente', 'admin'] as const
export type Rol = (typeof ROLES)[number]

const secreto = process.env.BETTER_AUTH_SECRET
if (!secreto && process.env.NODE_ENV === 'production') {
  throw new Error('Falta BETTER_AUTH_SECRET en producción')
}

const googleId = process.env.GOOGLE_CLIENT_ID
const googleSecret = process.env.GOOGLE_CLIENT_SECRET

/** Google queda activo solo si hay credenciales; sin ellas el botón no se muestra. */
export const hayGoogle = Boolean(googleId && googleSecret)

if (!db) {
  throw new Error('Falta DATABASE_URL: la autenticación necesita base de datos')
}

export const auth = betterAuth({
  appName: 'Jabones Mari',
  baseURL: process.env.BETTER_AUTH_URL ?? SITIO_URL,
  trustedOrigins: [SITIO_URL, 'http://localhost:3000'],
  secret: secreto ?? 'secreto-solo-para-desarrollo-local',

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: esquema.usuarios,
      session: esquema.sesiones,
      account: esquema.cuentas,
      verification: esquema.verificaciones,
    },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Se exige confirmar el correo con un código antes de entrar: evita
    // cuentas con correos ajenos o mal escritos, que luego no reciben nada.
    requireEmailVerification: true,
    autoSignIn: false,
  },

  socialProviders: hayGoogle
    ? {
        google: {
          clientId: googleId!,
          clientSecret: googleSecret!,
          // Si alguien ya se registró con correo y luego entra con Google,
          // se unen en la misma cuenta en vez de duplicarla.
          mapProfileToUser: (perfil) => ({
            name: perfil.name,
            image: perfil.picture,
          }),
        },
      }
    : {},

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },

  user: {
    additionalFields: {
      telefono: { type: 'string', required: false, input: true },
      direccion: { type: 'string', required: false, input: true },
      barrio: { type: 'string', required: false, input: true },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 días
    updateAge: 60 * 60 * 24, // se renueva una vez al día
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutos
      allowedAttempts: 5,
      // Con esto, verificar el código durante el registro da por confirmado
      // el correo sin pedir un segundo paso.
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        await enviarCodigo(email, otp, type as TipoCodigo)
      },
    }),
    pluginAdmin({
      defaultRole: 'cliente',
      adminRoles: ['admin'],
    }),
    // Debe ir de último: escribe las cookies en las Server Actions de Next.
    nextCookies(),
  ],
})

export type Sesion = typeof auth.$Infer.Session

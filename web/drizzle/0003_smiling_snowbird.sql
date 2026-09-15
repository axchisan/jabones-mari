CREATE TABLE "suscriptores_correo" (
	"id" text PRIMARY KEY NOT NULL,
	"correo" text NOT NULL,
	"nombre" text,
	"acepta" boolean DEFAULT true NOT NULL,
	"origen" text DEFAULT 'pedido' NOT NULL,
	"token_baja" text NOT NULL,
	"aceptado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"revocado_en" timestamp with time zone,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suscriptores_correo_correo_unique" UNIQUE("correo"),
	CONSTRAINT "suscriptores_correo_token_baja_unique" UNIQUE("token_baja")
);
--> statement-breakpoint
ALTER TABLE "pedidos" ADD COLUMN "correo" text;--> statement-breakpoint
ALTER TABLE "pedidos" ADD COLUMN "acepta_promociones" boolean DEFAULT false NOT NULL;
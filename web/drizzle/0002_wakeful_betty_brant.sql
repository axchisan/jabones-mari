CREATE TABLE "suscripciones_push" (
	"id" text PRIMARY KEY NOT NULL,
	"usuario_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"dispositivo" text,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"usada_en" timestamp with time zone,
	CONSTRAINT "suscripciones_push_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
ALTER TABLE "suscripciones_push" ADD CONSTRAINT "suscripciones_push_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
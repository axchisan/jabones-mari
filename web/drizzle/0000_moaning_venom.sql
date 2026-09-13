CREATE TABLE "ajustes" (
	"clave" text PRIMARY KEY NOT NULL,
	"valor" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" text PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"cliente_nombre" text NOT NULL,
	"telefono" text NOT NULL,
	"direccion" text,
	"barrio" text,
	"notas" text,
	"observaciones_internas" text,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"domicilio" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"estado" text DEFAULT 'abierto' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pedidos_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nombre" text NOT NULL,
	"claim" text,
	"descripcion" text,
	"modo_de_uso" text,
	"advertencia" text,
	"ingredientes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"beneficios" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tipo_de_piel" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"uso" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"aroma" text,
	"color_marca" text,
	"imagenes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"destacado" boolean DEFAULT false NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "productos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "variantes" (
	"id" text PRIMARY KEY NOT NULL,
	"producto_id" text NOT NULL,
	"tamano" text NOT NULL,
	"precio" integer NOT NULL,
	"peso_gramos" integer,
	"molde" text,
	"sku" text NOT NULL,
	"stock" integer,
	"disponible" boolean DEFAULT true NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "variantes_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
ALTER TABLE "variantes" ADD CONSTRAINT "variantes_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;
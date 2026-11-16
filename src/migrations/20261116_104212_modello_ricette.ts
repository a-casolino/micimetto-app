import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_video_stato" AS ENUM('creato', 'caricato', 'in-elaborazione', 'in-codifica', 'pronto', 'errore', 'caricamento-fallito');
  CREATE TYPE "public"."enum_ricette_gruppi_ingredienti_righe_unita" AS ENUM('g', 'kg', 'ml', 'cl', 'l', 'cucchiaio', 'cucchiaino', 'tazza', 'bicchiere', 'pezzo', 'spicchio', 'fetta', 'foglia', 'rametto', 'mazzetto', 'bustina', 'confezione', 'vasetto', 'noce', 'pizzico');
  CREATE TYPE "public"."enum_ricette_step_ingredienti_unita" AS ENUM('g', 'kg', 'ml', 'cl', 'l', 'cucchiaio', 'cucchiaino', 'tazza', 'bicchiere', 'pezzo', 'spicchio', 'fetta', 'foglia', 'rametto', 'mazzetto', 'bustina', 'confezione', 'vasetto', 'noce', 'pizzico');
  CREATE TYPE "public"."enum_ricette_step_timer_unita" AS ENUM('secondi', 'minuti', 'ore');
  CREATE TYPE "public"."enum__ricette_v_version_gruppi_ingredienti_righe_unita" AS ENUM('g', 'kg', 'ml', 'cl', 'l', 'cucchiaio', 'cucchiaino', 'tazza', 'bicchiere', 'pezzo', 'spicchio', 'fetta', 'foglia', 'rametto', 'mazzetto', 'bustina', 'confezione', 'vasetto', 'noce', 'pizzico');
  CREATE TYPE "public"."enum__ricette_v_version_step_ingredienti_unita" AS ENUM('g', 'kg', 'ml', 'cl', 'l', 'cucchiaio', 'cucchiaino', 'tazza', 'bicchiere', 'pezzo', 'spicchio', 'fetta', 'foglia', 'rametto', 'mazzetto', 'bustina', 'confezione', 'vasetto', 'noce', 'pizzico');
  CREATE TYPE "public"."enum__ricette_v_version_step_timer_unita" AS ENUM('secondi', 'minuti', 'ore');
  CREATE TABLE "video" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"bunny_id" varchar NOT NULL,
  	"stato" "enum_video_stato",
  	"risincronizza" boolean DEFAULT false,
  	"sincronizzato_il" timestamp(3) with time zone,
  	"durata" numeric,
  	"larghezza" numeric,
  	"altezza" numeric,
  	"anteprima" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ricette_step_timer" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"etichetta" varchar,
  	"durata" numeric,
  	"durata_max" numeric,
  	"unita" "enum_ricette_step_timer_unita" DEFAULT 'minuti'
  );
  
  CREATE TABLE "ricette_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_ricette_v_version_step_timer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"etichetta" varchar,
  	"durata" numeric,
  	"durata_max" numeric,
  	"unita" "enum__ricette_v_version_step_timer_unita" DEFAULT 'minuti',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ricette_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "ricette" DROP CONSTRAINT "ricette_categoria_id_categorie_id_fk";
  
  ALTER TABLE "ricette" DROP CONSTRAINT "ricette_occasione_id_occasioni_id_fk";
  
  ALTER TABLE "_ricette_v" DROP CONSTRAINT "_ricette_v_version_categoria_id_categorie_id_fk";
  
  ALTER TABLE "_ricette_v" DROP CONSTRAINT "_ricette_v_version_occasione_id_occasioni_id_fk";
  
  DROP INDEX "ricette_categoria_idx";
  DROP INDEX "ricette_occasione_idx";
  DROP INDEX "_ricette_v_version_version_categoria_idx";
  DROP INDEX "_ricette_v_version_version_occasione_idx";
  ALTER TABLE "ricette_gruppi_ingredienti_righe" ALTER COLUMN "unita" SET DATA TYPE "public"."enum_ricette_gruppi_ingredienti_righe_unita" USING "unita"::"public"."enum_ricette_gruppi_ingredienti_righe_unita";
  ALTER TABLE "ricette_step_ingredienti" ALTER COLUMN "unita" SET DATA TYPE "public"."enum_ricette_step_ingredienti_unita" USING "unita"::"public"."enum_ricette_step_ingredienti_unita";
  ALTER TABLE "ricette" ALTER COLUMN "dosi_per" SET DEFAULT 4;
  ALTER TABLE "_ricette_v_version_gruppi_ingredienti_righe" ALTER COLUMN "unita" SET DATA TYPE "public"."enum__ricette_v_version_gruppi_ingredienti_righe_unita" USING "unita"::"public"."enum__ricette_v_version_gruppi_ingredienti_righe_unita";
  ALTER TABLE "_ricette_v_version_step_ingredienti" ALTER COLUMN "unita" SET DATA TYPE "public"."enum__ricette_v_version_step_ingredienti_unita" USING "unita"::"public"."enum__ricette_v_version_step_ingredienti_unita";
  ALTER TABLE "_ricette_v" ALTER COLUMN "version_dosi_per" SET DEFAULT 4;
  ALTER TABLE "media" ADD COLUMN "didascalia" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_step_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_step_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_step_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_step_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_step_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_step_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filename" varchar;
  ALTER TABLE "ingredienti" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "ingredienti" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "ingredienti" ADD COLUMN "plurale" varchar;
  ALTER TABLE "ingredienti" ADD COLUMN "descrizione" varchar;
  ALTER TABLE "categorie" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "categorie" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "categorie" ADD COLUMN "parent_id" integer;
  ALTER TABLE "categorie" ADD COLUMN "descrizione" varchar;
  ALTER TABLE "indici_fit" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "indici_fit" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "indici_fit" ADD COLUMN "parent_id" integer;
  ALTER TABLE "indici_fit" ADD COLUMN "descrizione" varchar;
  ALTER TABLE "occasioni" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "occasioni" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "occasioni" ADD COLUMN "parent_id" integer;
  ALTER TABLE "occasioni" ADD COLUMN "descrizione" varchar;
  ALTER TABLE "ricette_gruppi_ingredienti_righe" ADD COLUMN "facoltativo" boolean DEFAULT false;
  ALTER TABLE "ricette_step_ingredienti" ADD COLUMN "nota" varchar;
  ALTER TABLE "ricette_step" ADD COLUMN "titolo" varchar;
  ALTER TABLE "ricette" ADD COLUMN "descrizione" varchar;
  ALTER TABLE "ricette" ADD COLUMN "riposo" numeric;
  ALTER TABLE "ricette" ADD COLUMN "seo_titolo" varchar;
  ALTER TABLE "ricette" ADD COLUMN "seo_descrizione" varchar;
  ALTER TABLE "ricette" ADD COLUMN "seo_immagine_id" integer;
  ALTER TABLE "ricette" ADD COLUMN "seo_noindex" boolean DEFAULT false;
  ALTER TABLE "ricette" ADD COLUMN "data_pubblicazione" timestamp(3) with time zone;
  ALTER TABLE "ricette" ADD COLUMN "tempo_totale" numeric;
  ALTER TABLE "ricette_rels" ADD COLUMN "video_id" integer;
  ALTER TABLE "ricette_rels" ADD COLUMN "categorie_id" integer;
  ALTER TABLE "ricette_rels" ADD COLUMN "occasioni_id" integer;
  ALTER TABLE "ricette_rels" ADD COLUMN "ingredienti_id" integer;
  ALTER TABLE "_ricette_v_version_gruppi_ingredienti_righe" ADD COLUMN "facoltativo" boolean DEFAULT false;
  ALTER TABLE "_ricette_v_version_step_ingredienti" ADD COLUMN "nota" varchar;
  ALTER TABLE "_ricette_v_version_step" ADD COLUMN "titolo" varchar;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_descrizione" varchar;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_riposo" numeric;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_seo_titolo" varchar;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_seo_descrizione" varchar;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_seo_immagine_id" integer;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_seo_noindex" boolean DEFAULT false;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_data_pubblicazione" timestamp(3) with time zone;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_tempo_totale" numeric;
  ALTER TABLE "_ricette_v_rels" ADD COLUMN "video_id" integer;
  ALTER TABLE "_ricette_v_rels" ADD COLUMN "categorie_id" integer;
  ALTER TABLE "_ricette_v_rels" ADD COLUMN "occasioni_id" integer;
  ALTER TABLE "_ricette_v_rels" ADD COLUMN "ingredienti_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "video_id" integer;
  ALTER TABLE "ricette_step_timer" ADD CONSTRAINT "ricette_step_timer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ricette_step"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette_texts" ADD CONSTRAINT "ricette_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ricette"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_version_step_timer" ADD CONSTRAINT "_ricette_v_version_step_timer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ricette_v_version_step"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_texts" ADD CONSTRAINT "_ricette_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_ricette_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "video_bunny_id_idx" ON "video" USING btree ("bunny_id");
  CREATE INDEX "video_updated_at_idx" ON "video" USING btree ("updated_at");
  CREATE INDEX "video_created_at_idx" ON "video" USING btree ("created_at");
  CREATE INDEX "ricette_step_timer_order_idx" ON "ricette_step_timer" USING btree ("_order");
  CREATE INDEX "ricette_step_timer_parent_id_idx" ON "ricette_step_timer" USING btree ("_parent_id");
  CREATE INDEX "ricette_texts_order_parent" ON "ricette_texts" USING btree ("order","parent_id");
  CREATE INDEX "_ricette_v_version_step_timer_order_idx" ON "_ricette_v_version_step_timer" USING btree ("_order");
  CREATE INDEX "_ricette_v_version_step_timer_parent_id_idx" ON "_ricette_v_version_step_timer" USING btree ("_parent_id");
  CREATE INDEX "_ricette_v_texts_order_parent" ON "_ricette_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "categorie" ADD CONSTRAINT "categorie_parent_id_categorie_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categorie"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "indici_fit" ADD CONSTRAINT "indici_fit_parent_id_indici_fit_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."indici_fit"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "occasioni" ADD CONSTRAINT "occasioni_parent_id_occasioni_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."occasioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette" ADD CONSTRAINT "ricette_seo_immagine_id_media_id_fk" FOREIGN KEY ("seo_immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette_rels" ADD CONSTRAINT "ricette_rels_video_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette_rels" ADD CONSTRAINT "ricette_rels_categorie_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categorie"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette_rels" ADD CONSTRAINT "ricette_rels_occasioni_fk" FOREIGN KEY ("occasioni_id") REFERENCES "public"."occasioni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette_rels" ADD CONSTRAINT "ricette_rels_ingredienti_fk" FOREIGN KEY ("ingredienti_id") REFERENCES "public"."ingredienti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v" ADD CONSTRAINT "_ricette_v_version_seo_immagine_id_media_id_fk" FOREIGN KEY ("version_seo_immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v_rels" ADD CONSTRAINT "_ricette_v_rels_video_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_rels" ADD CONSTRAINT "_ricette_v_rels_categorie_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categorie"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_rels" ADD CONSTRAINT "_ricette_v_rels_occasioni_fk" FOREIGN KEY ("occasioni_id") REFERENCES "public"."occasioni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_rels" ADD CONSTRAINT "_ricette_v_rels_ingredienti_fk" FOREIGN KEY ("ingredienti_id") REFERENCES "public"."ingredienti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_video_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_step_sizes_step_filename_idx" ON "media" USING btree ("sizes_step_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "ingredienti_slug_idx" ON "ingredienti" USING btree ("slug");
  CREATE UNIQUE INDEX "categorie_slug_idx" ON "categorie" USING btree ("slug");
  CREATE INDEX "categorie_parent_idx" ON "categorie" USING btree ("parent_id");
  CREATE UNIQUE INDEX "indici_fit_slug_idx" ON "indici_fit" USING btree ("slug");
  CREATE INDEX "indici_fit_parent_idx" ON "indici_fit" USING btree ("parent_id");
  CREATE UNIQUE INDEX "occasioni_slug_idx" ON "occasioni" USING btree ("slug");
  CREATE INDEX "occasioni_parent_idx" ON "occasioni" USING btree ("parent_id");
  CREATE INDEX "ricette_seo_seo_immagine_idx" ON "ricette" USING btree ("seo_immagine_id");
  CREATE INDEX "ricette_data_pubblicazione_idx" ON "ricette" USING btree ("data_pubblicazione");
  CREATE INDEX "ricette_tempo_totale_idx" ON "ricette" USING btree ("tempo_totale");
  CREATE INDEX "ricette_rels_video_id_idx" ON "ricette_rels" USING btree ("video_id");
  CREATE INDEX "ricette_rels_categorie_id_idx" ON "ricette_rels" USING btree ("categorie_id");
  CREATE INDEX "ricette_rels_occasioni_id_idx" ON "ricette_rels" USING btree ("occasioni_id");
  CREATE INDEX "ricette_rels_ingredienti_id_idx" ON "ricette_rels" USING btree ("ingredienti_id");
  CREATE INDEX "_ricette_v_version_seo_version_seo_immagine_idx" ON "_ricette_v" USING btree ("version_seo_immagine_id");
  CREATE INDEX "_ricette_v_version_version_data_pubblicazione_idx" ON "_ricette_v" USING btree ("version_data_pubblicazione");
  CREATE INDEX "_ricette_v_version_version_tempo_totale_idx" ON "_ricette_v" USING btree ("version_tempo_totale");
  CREATE INDEX "_ricette_v_rels_video_id_idx" ON "_ricette_v_rels" USING btree ("video_id");
  CREATE INDEX "_ricette_v_rels_categorie_id_idx" ON "_ricette_v_rels" USING btree ("categorie_id");
  CREATE INDEX "_ricette_v_rels_occasioni_id_idx" ON "_ricette_v_rels" USING btree ("occasioni_id");
  CREATE INDEX "_ricette_v_rels_ingredienti_id_idx" ON "_ricette_v_rels" USING btree ("ingredienti_id");
  CREATE INDEX "payload_locked_documents_rels_video_id_idx" ON "payload_locked_documents_rels" USING btree ("video_id");
  ALTER TABLE "ricette_step" DROP COLUMN "bunny_video_id";
  ALTER TABLE "ricette" DROP COLUMN "categoria_id";
  ALTER TABLE "ricette" DROP COLUMN "occasione_id";
  ALTER TABLE "_ricette_v_version_step" DROP COLUMN "bunny_video_id";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_categoria_id";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_occasione_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ricette_step_timer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ricette_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_ricette_v_version_step_timer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_ricette_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "video" CASCADE;
  DROP TABLE "ricette_step_timer" CASCADE;
  DROP TABLE "ricette_texts" CASCADE;
  DROP TABLE "_ricette_v_version_step_timer" CASCADE;
  DROP TABLE "_ricette_v_texts" CASCADE;
  ALTER TABLE "categorie" DROP CONSTRAINT IF EXISTS "categorie_parent_id_categorie_id_fk";
  
  ALTER TABLE "indici_fit" DROP CONSTRAINT IF EXISTS "indici_fit_parent_id_indici_fit_id_fk";
  
  ALTER TABLE "occasioni" DROP CONSTRAINT IF EXISTS "occasioni_parent_id_occasioni_id_fk";
  
  ALTER TABLE "ricette" DROP CONSTRAINT IF EXISTS "ricette_seo_immagine_id_media_id_fk";
  
  ALTER TABLE "ricette_rels" DROP CONSTRAINT IF EXISTS "ricette_rels_video_fk";
  
  ALTER TABLE "ricette_rels" DROP CONSTRAINT IF EXISTS "ricette_rels_categorie_fk";
  
  ALTER TABLE "ricette_rels" DROP CONSTRAINT IF EXISTS "ricette_rels_occasioni_fk";
  
  ALTER TABLE "ricette_rels" DROP CONSTRAINT IF EXISTS "ricette_rels_ingredienti_fk";
  
  ALTER TABLE "_ricette_v" DROP CONSTRAINT IF EXISTS "_ricette_v_version_seo_immagine_id_media_id_fk";
  
  ALTER TABLE "_ricette_v_rels" DROP CONSTRAINT IF EXISTS "_ricette_v_rels_video_fk";
  
  ALTER TABLE "_ricette_v_rels" DROP CONSTRAINT IF EXISTS "_ricette_v_rels_categorie_fk";
  
  ALTER TABLE "_ricette_v_rels" DROP CONSTRAINT IF EXISTS "_ricette_v_rels_occasioni_fk";
  
  ALTER TABLE "_ricette_v_rels" DROP CONSTRAINT IF EXISTS "_ricette_v_rels_ingredienti_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_video_fk";
  
  DROP INDEX IF EXISTS "media_sizes_card_sizes_card_filename_idx";
  DROP INDEX IF EXISTS "media_sizes_step_sizes_step_filename_idx";
  DROP INDEX IF EXISTS "media_sizes_hero_sizes_hero_filename_idx";
  DROP INDEX IF EXISTS "media_sizes_og_sizes_og_filename_idx";
  DROP INDEX IF EXISTS "ingredienti_slug_idx";
  DROP INDEX IF EXISTS "categorie_slug_idx";
  DROP INDEX IF EXISTS "categorie_parent_idx";
  DROP INDEX IF EXISTS "indici_fit_slug_idx";
  DROP INDEX IF EXISTS "indici_fit_parent_idx";
  DROP INDEX IF EXISTS "occasioni_slug_idx";
  DROP INDEX IF EXISTS "occasioni_parent_idx";
  DROP INDEX IF EXISTS "ricette_seo_seo_immagine_idx";
  DROP INDEX IF EXISTS "ricette_data_pubblicazione_idx";
  DROP INDEX IF EXISTS "ricette_tempo_totale_idx";
  DROP INDEX IF EXISTS "ricette_rels_video_id_idx";
  DROP INDEX IF EXISTS "ricette_rels_categorie_id_idx";
  DROP INDEX IF EXISTS "ricette_rels_occasioni_id_idx";
  DROP INDEX IF EXISTS "ricette_rels_ingredienti_id_idx";
  DROP INDEX IF EXISTS "_ricette_v_version_seo_version_seo_immagine_idx";
  DROP INDEX IF EXISTS "_ricette_v_version_version_data_pubblicazione_idx";
  DROP INDEX IF EXISTS "_ricette_v_version_version_tempo_totale_idx";
  DROP INDEX IF EXISTS "_ricette_v_rels_video_id_idx";
  DROP INDEX IF EXISTS "_ricette_v_rels_categorie_id_idx";
  DROP INDEX IF EXISTS "_ricette_v_rels_occasioni_id_idx";
  DROP INDEX IF EXISTS "_ricette_v_rels_ingredienti_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_video_id_idx";
  ALTER TABLE "ricette_gruppi_ingredienti_righe" ALTER COLUMN "unita" SET DATA TYPE varchar;
  ALTER TABLE "ricette_step_ingredienti" ALTER COLUMN "unita" SET DATA TYPE varchar;
  ALTER TABLE "ricette" ALTER COLUMN "dosi_per" SET DEFAULT 1;
  ALTER TABLE "_ricette_v_version_gruppi_ingredienti_righe" ALTER COLUMN "unita" SET DATA TYPE varchar;
  ALTER TABLE "_ricette_v_version_step_ingredienti" ALTER COLUMN "unita" SET DATA TYPE varchar;
  ALTER TABLE "_ricette_v" ALTER COLUMN "version_dosi_per" SET DEFAULT 1;
  ALTER TABLE "ricette_step" ADD COLUMN "bunny_video_id" varchar;
  ALTER TABLE "ricette" ADD COLUMN "categoria_id" integer;
  ALTER TABLE "ricette" ADD COLUMN "occasione_id" integer;
  ALTER TABLE "_ricette_v_version_step" ADD COLUMN "bunny_video_id" varchar;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_categoria_id" integer;
  ALTER TABLE "_ricette_v" ADD COLUMN "version_occasione_id" integer;
  ALTER TABLE "ricette" ADD CONSTRAINT "ricette_categoria_id_categorie_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorie"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette" ADD CONSTRAINT "ricette_occasione_id_occasioni_id_fk" FOREIGN KEY ("occasione_id") REFERENCES "public"."occasioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v" ADD CONSTRAINT "_ricette_v_version_categoria_id_categorie_id_fk" FOREIGN KEY ("version_categoria_id") REFERENCES "public"."categorie"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v" ADD CONSTRAINT "_ricette_v_version_occasione_id_occasioni_id_fk" FOREIGN KEY ("version_occasione_id") REFERENCES "public"."occasioni"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "ricette_categoria_idx" ON "ricette" USING btree ("categoria_id");
  CREATE INDEX "ricette_occasione_idx" ON "ricette" USING btree ("occasione_id");
  CREATE INDEX "_ricette_v_version_version_categoria_idx" ON "_ricette_v" USING btree ("version_categoria_id");
  CREATE INDEX "_ricette_v_version_version_occasione_idx" ON "_ricette_v" USING btree ("version_occasione_id");
  ALTER TABLE "media" DROP COLUMN "didascalia";
  ALTER TABLE "media" DROP COLUMN "sizes_card_url";
  ALTER TABLE "media" DROP COLUMN "sizes_card_width";
  ALTER TABLE "media" DROP COLUMN "sizes_card_height";
  ALTER TABLE "media" DROP COLUMN "sizes_card_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_step_url";
  ALTER TABLE "media" DROP COLUMN "sizes_step_width";
  ALTER TABLE "media" DROP COLUMN "sizes_step_height";
  ALTER TABLE "media" DROP COLUMN "sizes_step_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_step_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_step_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_url";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_width";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_height";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_og_url";
  ALTER TABLE "media" DROP COLUMN "sizes_og_width";
  ALTER TABLE "media" DROP COLUMN "sizes_og_height";
  ALTER TABLE "media" DROP COLUMN "sizes_og_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_og_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_og_filename";
  ALTER TABLE "ingredienti" DROP COLUMN "generate_slug";
  ALTER TABLE "ingredienti" DROP COLUMN "slug";
  ALTER TABLE "ingredienti" DROP COLUMN "plurale";
  ALTER TABLE "ingredienti" DROP COLUMN "descrizione";
  ALTER TABLE "categorie" DROP COLUMN "generate_slug";
  ALTER TABLE "categorie" DROP COLUMN "slug";
  ALTER TABLE "categorie" DROP COLUMN "parent_id";
  ALTER TABLE "categorie" DROP COLUMN "descrizione";
  ALTER TABLE "indici_fit" DROP COLUMN "generate_slug";
  ALTER TABLE "indici_fit" DROP COLUMN "slug";
  ALTER TABLE "indici_fit" DROP COLUMN "parent_id";
  ALTER TABLE "indici_fit" DROP COLUMN "descrizione";
  ALTER TABLE "occasioni" DROP COLUMN "generate_slug";
  ALTER TABLE "occasioni" DROP COLUMN "slug";
  ALTER TABLE "occasioni" DROP COLUMN "parent_id";
  ALTER TABLE "occasioni" DROP COLUMN "descrizione";
  ALTER TABLE "ricette_gruppi_ingredienti_righe" DROP COLUMN "facoltativo";
  ALTER TABLE "ricette_step_ingredienti" DROP COLUMN "nota";
  ALTER TABLE "ricette_step" DROP COLUMN "titolo";
  ALTER TABLE "ricette" DROP COLUMN "descrizione";
  ALTER TABLE "ricette" DROP COLUMN "riposo";
  ALTER TABLE "ricette" DROP COLUMN "seo_titolo";
  ALTER TABLE "ricette" DROP COLUMN "seo_descrizione";
  ALTER TABLE "ricette" DROP COLUMN "seo_immagine_id";
  ALTER TABLE "ricette" DROP COLUMN "seo_noindex";
  ALTER TABLE "ricette" DROP COLUMN "data_pubblicazione";
  ALTER TABLE "ricette" DROP COLUMN "tempo_totale";
  ALTER TABLE "ricette_rels" DROP COLUMN "video_id";
  ALTER TABLE "ricette_rels" DROP COLUMN "categorie_id";
  ALTER TABLE "ricette_rels" DROP COLUMN "occasioni_id";
  ALTER TABLE "ricette_rels" DROP COLUMN "ingredienti_id";
  ALTER TABLE "_ricette_v_version_gruppi_ingredienti_righe" DROP COLUMN "facoltativo";
  ALTER TABLE "_ricette_v_version_step_ingredienti" DROP COLUMN "nota";
  ALTER TABLE "_ricette_v_version_step" DROP COLUMN "titolo";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_descrizione";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_riposo";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_seo_titolo";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_seo_descrizione";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_seo_immagine_id";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_seo_noindex";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_data_pubblicazione";
  ALTER TABLE "_ricette_v" DROP COLUMN "version_tempo_totale";
  ALTER TABLE "_ricette_v_rels" DROP COLUMN "video_id";
  ALTER TABLE "_ricette_v_rels" DROP COLUMN "categorie_id";
  ALTER TABLE "_ricette_v_rels" DROP COLUMN "occasioni_id";
  ALTER TABLE "_ricette_v_rels" DROP COLUMN "ingredienti_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "video_id";
  DROP TYPE "public"."enum_video_stato";
  DROP TYPE "public"."enum_ricette_gruppi_ingredienti_righe_unita";
  DROP TYPE "public"."enum_ricette_step_ingredienti_unita";
  DROP TYPE "public"."enum_ricette_step_timer_unita";
  DROP TYPE "public"."enum__ricette_v_version_gruppi_ingredienti_righe_unita";
  DROP TYPE "public"."enum__ricette_v_version_step_ingredienti_unita";
  DROP TYPE "public"."enum__ricette_v_version_step_timer_unita";`)
}

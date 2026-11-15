import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_ruolo" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_ricette_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__ricette_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ruolo" "enum_users_ruolo" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "ingredienti" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorie" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "indici_fit" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "occasioni" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ricette_gruppi_ingredienti_righe" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ingrediente_id" integer,
  	"quantita" numeric,
  	"unita" varchar,
  	"nota" varchar
  );
  
  CREATE TABLE "ricette_gruppi_ingredienti" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titolo" varchar
  );
  
  CREATE TABLE "ricette_step_ingredienti" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ingrediente_id" integer,
  	"quantita" numeric,
  	"unita" varchar
  );
  
  CREATE TABLE "ricette_step" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"procedimento" jsonb,
  	"consiglio" jsonb,
  	"immagine_id" integer,
  	"bunny_video_id" varchar
  );
  
  CREATE TABLE "ricette" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"immagine_id" integer,
  	"introduzione" jsonb,
  	"tempo" numeric,
  	"cottura" numeric,
  	"difficolta" numeric,
  	"valutazione" numeric,
  	"dosi_per" numeric DEFAULT 1,
  	"dosi_unita" varchar DEFAULT 'persone',
  	"categoria_id" integer,
  	"indice_fit_id" integer,
  	"occasione_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_ricette_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "ricette_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_ricette_v_version_gruppi_ingredienti_righe" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"ingrediente_id" integer,
  	"quantita" numeric,
  	"unita" varchar,
  	"nota" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ricette_v_version_gruppi_ingredienti" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ricette_v_version_step_ingredienti" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"ingrediente_id" integer,
  	"quantita" numeric,
  	"unita" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ricette_v_version_step" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"procedimento" jsonb,
  	"consiglio" jsonb,
  	"immagine_id" integer,
  	"bunny_video_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_ricette_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titolo" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_immagine_id" integer,
  	"version_introduzione" jsonb,
  	"version_tempo" numeric,
  	"version_cottura" numeric,
  	"version_difficolta" numeric,
  	"version_valutazione" numeric,
  	"version_dosi_per" numeric DEFAULT 1,
  	"version_dosi_unita" varchar DEFAULT 'persone',
  	"version_categoria_id" integer,
  	"version_indice_fit_id" integer,
  	"version_occasione_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__ricette_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_ricette_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"ingredienti_id" integer,
  	"categorie_id" integer,
  	"indici_fit_id" integer,
  	"occasioni_id" integer,
  	"ricette_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette_gruppi_ingredienti_righe" ADD CONSTRAINT "ricette_gruppi_ingredienti_righe_ingrediente_id_ingredienti_id_fk" FOREIGN KEY ("ingrediente_id") REFERENCES "public"."ingredienti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette_gruppi_ingredienti_righe" ADD CONSTRAINT "ricette_gruppi_ingredienti_righe_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ricette_gruppi_ingredienti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette_gruppi_ingredienti" ADD CONSTRAINT "ricette_gruppi_ingredienti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ricette"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette_step_ingredienti" ADD CONSTRAINT "ricette_step_ingredienti_ingrediente_id_ingredienti_id_fk" FOREIGN KEY ("ingrediente_id") REFERENCES "public"."ingredienti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette_step_ingredienti" ADD CONSTRAINT "ricette_step_ingredienti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ricette_step"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette_step" ADD CONSTRAINT "ricette_step_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette_step" ADD CONSTRAINT "ricette_step_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ricette"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette" ADD CONSTRAINT "ricette_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette" ADD CONSTRAINT "ricette_categoria_id_categorie_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorie"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette" ADD CONSTRAINT "ricette_indice_fit_id_indici_fit_id_fk" FOREIGN KEY ("indice_fit_id") REFERENCES "public"."indici_fit"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette" ADD CONSTRAINT "ricette_occasione_id_occasioni_id_fk" FOREIGN KEY ("occasione_id") REFERENCES "public"."occasioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ricette_rels" ADD CONSTRAINT "ricette_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ricette"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ricette_rels" ADD CONSTRAINT "ricette_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_version_gruppi_ingredienti_righe" ADD CONSTRAINT "_ricette_v_version_gruppi_ingredienti_righe_ingrediente_id_ingredienti_id_fk" FOREIGN KEY ("ingrediente_id") REFERENCES "public"."ingredienti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v_version_gruppi_ingredienti_righe" ADD CONSTRAINT "_ricette_v_version_gruppi_ingredienti_righe_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ricette_v_version_gruppi_ingredienti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_version_gruppi_ingredienti" ADD CONSTRAINT "_ricette_v_version_gruppi_ingredienti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ricette_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_version_step_ingredienti" ADD CONSTRAINT "_ricette_v_version_step_ingredienti_ingrediente_id_ingredienti_id_fk" FOREIGN KEY ("ingrediente_id") REFERENCES "public"."ingredienti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v_version_step_ingredienti" ADD CONSTRAINT "_ricette_v_version_step_ingredienti_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ricette_v_version_step"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_version_step" ADD CONSTRAINT "_ricette_v_version_step_immagine_id_media_id_fk" FOREIGN KEY ("immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v_version_step" ADD CONSTRAINT "_ricette_v_version_step_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ricette_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v" ADD CONSTRAINT "_ricette_v_parent_id_ricette_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ricette"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v" ADD CONSTRAINT "_ricette_v_version_immagine_id_media_id_fk" FOREIGN KEY ("version_immagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v" ADD CONSTRAINT "_ricette_v_version_categoria_id_categorie_id_fk" FOREIGN KEY ("version_categoria_id") REFERENCES "public"."categorie"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v" ADD CONSTRAINT "_ricette_v_version_indice_fit_id_indici_fit_id_fk" FOREIGN KEY ("version_indice_fit_id") REFERENCES "public"."indici_fit"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v" ADD CONSTRAINT "_ricette_v_version_occasione_id_occasioni_id_fk" FOREIGN KEY ("version_occasione_id") REFERENCES "public"."occasioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ricette_v_rels" ADD CONSTRAINT "_ricette_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_ricette_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ricette_v_rels" ADD CONSTRAINT "_ricette_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingredienti_fk" FOREIGN KEY ("ingredienti_id") REFERENCES "public"."ingredienti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorie_fk" FOREIGN KEY ("categorie_id") REFERENCES "public"."categorie"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_indici_fit_fk" FOREIGN KEY ("indici_fit_id") REFERENCES "public"."indici_fit"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_occasioni_fk" FOREIGN KEY ("occasioni_id") REFERENCES "public"."occasioni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ricette_fk" FOREIGN KEY ("ricette_id") REFERENCES "public"."ricette"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "ingredienti_updated_at_idx" ON "ingredienti" USING btree ("updated_at");
  CREATE INDEX "ingredienti_created_at_idx" ON "ingredienti" USING btree ("created_at");
  CREATE INDEX "categorie_updated_at_idx" ON "categorie" USING btree ("updated_at");
  CREATE INDEX "categorie_created_at_idx" ON "categorie" USING btree ("created_at");
  CREATE INDEX "indici_fit_updated_at_idx" ON "indici_fit" USING btree ("updated_at");
  CREATE INDEX "indici_fit_created_at_idx" ON "indici_fit" USING btree ("created_at");
  CREATE INDEX "occasioni_updated_at_idx" ON "occasioni" USING btree ("updated_at");
  CREATE INDEX "occasioni_created_at_idx" ON "occasioni" USING btree ("created_at");
  CREATE INDEX "ricette_gruppi_ingredienti_righe_order_idx" ON "ricette_gruppi_ingredienti_righe" USING btree ("_order");
  CREATE INDEX "ricette_gruppi_ingredienti_righe_parent_id_idx" ON "ricette_gruppi_ingredienti_righe" USING btree ("_parent_id");
  CREATE INDEX "ricette_gruppi_ingredienti_righe_ingrediente_idx" ON "ricette_gruppi_ingredienti_righe" USING btree ("ingrediente_id");
  CREATE INDEX "ricette_gruppi_ingredienti_order_idx" ON "ricette_gruppi_ingredienti" USING btree ("_order");
  CREATE INDEX "ricette_gruppi_ingredienti_parent_id_idx" ON "ricette_gruppi_ingredienti" USING btree ("_parent_id");
  CREATE INDEX "ricette_step_ingredienti_order_idx" ON "ricette_step_ingredienti" USING btree ("_order");
  CREATE INDEX "ricette_step_ingredienti_parent_id_idx" ON "ricette_step_ingredienti" USING btree ("_parent_id");
  CREATE INDEX "ricette_step_ingredienti_ingrediente_idx" ON "ricette_step_ingredienti" USING btree ("ingrediente_id");
  CREATE INDEX "ricette_step_order_idx" ON "ricette_step" USING btree ("_order");
  CREATE INDEX "ricette_step_parent_id_idx" ON "ricette_step" USING btree ("_parent_id");
  CREATE INDEX "ricette_step_immagine_idx" ON "ricette_step" USING btree ("immagine_id");
  CREATE UNIQUE INDEX "ricette_slug_idx" ON "ricette" USING btree ("slug");
  CREATE INDEX "ricette_immagine_idx" ON "ricette" USING btree ("immagine_id");
  CREATE INDEX "ricette_categoria_idx" ON "ricette" USING btree ("categoria_id");
  CREATE INDEX "ricette_indice_fit_idx" ON "ricette" USING btree ("indice_fit_id");
  CREATE INDEX "ricette_occasione_idx" ON "ricette" USING btree ("occasione_id");
  CREATE INDEX "ricette_updated_at_idx" ON "ricette" USING btree ("updated_at");
  CREATE INDEX "ricette_created_at_idx" ON "ricette" USING btree ("created_at");
  CREATE INDEX "ricette__status_idx" ON "ricette" USING btree ("_status");
  CREATE INDEX "ricette_rels_order_idx" ON "ricette_rels" USING btree ("order");
  CREATE INDEX "ricette_rels_parent_idx" ON "ricette_rels" USING btree ("parent_id");
  CREATE INDEX "ricette_rels_path_idx" ON "ricette_rels" USING btree ("path");
  CREATE INDEX "ricette_rels_media_id_idx" ON "ricette_rels" USING btree ("media_id");
  CREATE INDEX "_ricette_v_version_gruppi_ingredienti_righe_order_idx" ON "_ricette_v_version_gruppi_ingredienti_righe" USING btree ("_order");
  CREATE INDEX "_ricette_v_version_gruppi_ingredienti_righe_parent_id_idx" ON "_ricette_v_version_gruppi_ingredienti_righe" USING btree ("_parent_id");
  CREATE INDEX "_ricette_v_version_gruppi_ingredienti_righe_ingrediente_idx" ON "_ricette_v_version_gruppi_ingredienti_righe" USING btree ("ingrediente_id");
  CREATE INDEX "_ricette_v_version_gruppi_ingredienti_order_idx" ON "_ricette_v_version_gruppi_ingredienti" USING btree ("_order");
  CREATE INDEX "_ricette_v_version_gruppi_ingredienti_parent_id_idx" ON "_ricette_v_version_gruppi_ingredienti" USING btree ("_parent_id");
  CREATE INDEX "_ricette_v_version_step_ingredienti_order_idx" ON "_ricette_v_version_step_ingredienti" USING btree ("_order");
  CREATE INDEX "_ricette_v_version_step_ingredienti_parent_id_idx" ON "_ricette_v_version_step_ingredienti" USING btree ("_parent_id");
  CREATE INDEX "_ricette_v_version_step_ingredienti_ingrediente_idx" ON "_ricette_v_version_step_ingredienti" USING btree ("ingrediente_id");
  CREATE INDEX "_ricette_v_version_step_order_idx" ON "_ricette_v_version_step" USING btree ("_order");
  CREATE INDEX "_ricette_v_version_step_parent_id_idx" ON "_ricette_v_version_step" USING btree ("_parent_id");
  CREATE INDEX "_ricette_v_version_step_immagine_idx" ON "_ricette_v_version_step" USING btree ("immagine_id");
  CREATE INDEX "_ricette_v_parent_idx" ON "_ricette_v" USING btree ("parent_id");
  CREATE INDEX "_ricette_v_version_version_slug_idx" ON "_ricette_v" USING btree ("version_slug");
  CREATE INDEX "_ricette_v_version_version_immagine_idx" ON "_ricette_v" USING btree ("version_immagine_id");
  CREATE INDEX "_ricette_v_version_version_categoria_idx" ON "_ricette_v" USING btree ("version_categoria_id");
  CREATE INDEX "_ricette_v_version_version_indice_fit_idx" ON "_ricette_v" USING btree ("version_indice_fit_id");
  CREATE INDEX "_ricette_v_version_version_occasione_idx" ON "_ricette_v" USING btree ("version_occasione_id");
  CREATE INDEX "_ricette_v_version_version_updated_at_idx" ON "_ricette_v" USING btree ("version_updated_at");
  CREATE INDEX "_ricette_v_version_version_created_at_idx" ON "_ricette_v" USING btree ("version_created_at");
  CREATE INDEX "_ricette_v_version_version__status_idx" ON "_ricette_v" USING btree ("version__status");
  CREATE INDEX "_ricette_v_created_at_idx" ON "_ricette_v" USING btree ("created_at");
  CREATE INDEX "_ricette_v_updated_at_idx" ON "_ricette_v" USING btree ("updated_at");
  CREATE INDEX "_ricette_v_latest_idx" ON "_ricette_v" USING btree ("latest");
  CREATE INDEX "_ricette_v_rels_order_idx" ON "_ricette_v_rels" USING btree ("order");
  CREATE INDEX "_ricette_v_rels_parent_idx" ON "_ricette_v_rels" USING btree ("parent_id");
  CREATE INDEX "_ricette_v_rels_path_idx" ON "_ricette_v_rels" USING btree ("path");
  CREATE INDEX "_ricette_v_rels_media_id_idx" ON "_ricette_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_ingredienti_id_idx" ON "payload_locked_documents_rels" USING btree ("ingredienti_id");
  CREATE INDEX "payload_locked_documents_rels_categorie_id_idx" ON "payload_locked_documents_rels" USING btree ("categorie_id");
  CREATE INDEX "payload_locked_documents_rels_indici_fit_id_idx" ON "payload_locked_documents_rels" USING btree ("indici_fit_id");
  CREATE INDEX "payload_locked_documents_rels_occasioni_id_idx" ON "payload_locked_documents_rels" USING btree ("occasioni_id");
  CREATE INDEX "payload_locked_documents_rels_ricette_id_idx" ON "payload_locked_documents_rels" USING btree ("ricette_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "ingredienti" CASCADE;
  DROP TABLE "categorie" CASCADE;
  DROP TABLE "indici_fit" CASCADE;
  DROP TABLE "occasioni" CASCADE;
  DROP TABLE "ricette_gruppi_ingredienti_righe" CASCADE;
  DROP TABLE "ricette_gruppi_ingredienti" CASCADE;
  DROP TABLE "ricette_step_ingredienti" CASCADE;
  DROP TABLE "ricette_step" CASCADE;
  DROP TABLE "ricette" CASCADE;
  DROP TABLE "ricette_rels" CASCADE;
  DROP TABLE "_ricette_v_version_gruppi_ingredienti_righe" CASCADE;
  DROP TABLE "_ricette_v_version_gruppi_ingredienti" CASCADE;
  DROP TABLE "_ricette_v_version_step_ingredienti" CASCADE;
  DROP TABLE "_ricette_v_version_step" CASCADE;
  DROP TABLE "_ricette_v" CASCADE;
  DROP TABLE "_ricette_v_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_ruolo";
  DROP TYPE "public"."enum_ricette_status";
  DROP TYPE "public"."enum__ricette_v_version_status";`)
}

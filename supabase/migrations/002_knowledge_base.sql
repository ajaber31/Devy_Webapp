-- ============================================================
-- Devy Phase 2: Global Knowledge Base Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
--
-- PREREQUISITE: Enable the 'vector' extension first:
--   Dashboard → Database → Extensions → search "vector" → Enable
--
-- Then create the Storage bucket manually:
--   Dashboard → Storage → New Bucket
--   Name: documents   Access: Private (Restricted)
-- ============================================================


-- ----------------------------------------
-- Table: documents
-- Tracks uploaded knowledge base files and their processing state.
-- ----------------------------------------
CREATE TABLE public.documents (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text        NOT NULL,
  original_filename text        NOT NULL,
  file_type         text        NOT NULL CHECK (file_type IN ('pdf','docx','txt')),
  storage_path      text        NOT NULL,
  uploaded_by       uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  status            text        NOT NULL DEFAULT 'uploaded'
                                CHECK (status IN ('uploaded','parsing','chunking','embedding','ready','failed')),
  error_message     text,
  tags              text[]      NOT NULL DEFAULT '{}',
  chunk_count       integer     NOT NULL DEFAULT 0,
  uploaded_at       timestamptz NOT NULL DEFAULT now(),
  processed_at      timestamptz,
  file_size_bytes   bigint
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage documents"
  ON public.documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- ----------------------------------------
-- Table: document_chunks
-- Stores parsed text chunks with vector embeddings for semantic search.
-- Embeddings use OpenAI text-embedding-3-small (1536 dimensions).
-- ----------------------------------------
CREATE TABLE public.document_chunks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid        NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index  integer     NOT NULL,
  content      text        NOT NULL,
  embedding    vector(1536),
  metadata     jsonb       NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- IVFFlat index for approximate nearest-neighbor search.
-- NOTE: lists=100 is effective once there are ~3,000+ chunks.
-- For a fresh database, Postgres will warn but still work via sequential scan.
CREATE INDEX ON public.document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for fast lookups by document (used in DELETE CASCADE and reprocessing)
CREATE INDEX ON public.document_chunks (document_id);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chunks"
  ON public.document_chunks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert chunks"
  ON public.document_chunks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete chunks"
  ON public.document_chunks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- ----------------------------------------
-- Function: match_chunks
-- Semantic search via cosine similarity.
-- Called by the retrieval layer; returns top-K chunks above threshold.
-- Includes document title + filename for source citation.
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding  vector(1536),
  match_threshold  float    DEFAULT 0.70,
  match_count      int      DEFAULT 10,
  filter_tags      text[]   DEFAULT NULL
)
RETURNS TABLE (
  id               uuid,
  document_id      uuid,
  chunk_index      integer,
  content          text,
  metadata         jsonb,
  similarity       float,
  document_title   text,
  original_filename text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    d.title            AS document_title,
    d.original_filename
  FROM public.document_chunks dc
  JOIN public.documents d ON d.id = dc.document_id
  WHERE
    d.status = 'ready'
    AND dc.embedding IS NOT NULL
    AND (filter_tags IS NULL OR d.tags && filter_tags)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- ----------------------------------------
-- Storage bucket RLS policies
-- Run these after creating the 'documents' bucket in the Dashboard.
-- ----------------------------------------
CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

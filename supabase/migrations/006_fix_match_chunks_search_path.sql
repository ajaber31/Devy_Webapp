-- ─── Migration 006: Fix match_chunks search_path ───────────────────────────
-- Bug: match_chunks failed with `operator does not exist: extensions.vector
-- <=> extensions.vector` because the function ran without `extensions` in
-- search_path. Every chat retrieval silently returned 0 chunks, so citation
-- cards never appeared in the UI.
-- Fix: pin search_path to `public, extensions` so the pgvector cosine
-- distance operator resolves.

CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding  extensions.vector(1536),
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
SET search_path = public, extensions
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

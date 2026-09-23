import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { deleteFiles } from '@/services/storage'

export type OrderedRow = { id: string; display_order: number }

export type Payload = Record<string, unknown>

/** Data access used by the admin CollectionManager for one ordered table. */
export type CollectionService<Row extends OrderedRow> = {
  list: () => Promise<Row[]>
  create: (payload: Payload, displayOrder: number) => Promise<void>
  update: (id: string, payload: Payload) => Promise<void>
  remove: (row: Row) => Promise<void>
  reorder: (rows: Row[]) => Promise<void>
}

type OrderedTable =
  | 'experiences'
  | 'projects'
  | 'skill_categories'
  | 'skills'
  | 'education'
  | 'certifications'
  | 'achievements'
  | 'social_links'

// The typed client can't narrow a union of table names, so queries built from
// a table variable go through this untyped view. Row types are enforced by the
// callers' generic parameter instead.
const untyped = supabase as unknown as SupabaseClient

/**
 * Standard CRUD for a table with `display_order`. `imageColumns` are storage
 * paths in the media bucket that are cleaned up when a row is deleted.
 */
export function createCollectionService<Row extends OrderedRow>(
  table: OrderedTable,
  { imageColumns = [] as string[] } = {},
): CollectionService<Row> {
  return {
    async list() {
      const { data, error } = await untyped
        .from(table)
        .select('*')
        .order('display_order')
        .order('created_at')
      if (error) throw error
      return data as unknown as Row[]
    },

    async create(payload, displayOrder) {
      const { error } = await untyped
        .from(table)
        .insert({ ...payload, display_order: displayOrder })
      if (error) throw error
    },

    async update(id, payload) {
      const { error } = await untyped
        .from(table)
        .update(payload)
        .eq('id', id)
      if (error) throw error
    },

    async remove(row) {
      const { error } = await untyped.from(table).delete().eq('id', row.id)
      if (error) throw error
      const record = row as unknown as Record<string, string | null>
      await deleteFiles(
        'media',
        imageColumns.map((column) => record[column]),
      )
    },

    async reorder(rows) {
      const changed = rows
        .map((row, index) => ({ row, index }))
        .filter(({ row, index }) => row.display_order !== index)

      const results = await Promise.all(
        changed.map(({ row, index }) =>
          untyped
            .from(table)
            .update({ display_order: index })
            .eq('id', row.id),
        ),
      )
      const failed = results.find((result) => result.error)
      if (failed?.error) throw failed.error
    },
  }
}

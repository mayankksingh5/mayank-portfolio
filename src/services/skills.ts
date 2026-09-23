import { supabase } from '@/lib/supabase'
import { createCollectionService } from '@/services/collection'
import type { Skill, SkillCategory } from '@/types/database'

export const skillCategoriesService = createCollectionService<SkillCategory>('skill_categories')

export async function listSkills() {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('display_order')
    .order('created_at')
  if (error) throw error
  return data as Skill[]
}

export async function addSkill(categoryId: string, name: string, displayOrder: number) {
  const { error } = await supabase
    .from('skills')
    .insert({ category_id: categoryId, name, display_order: displayOrder })
  if (error) throw error
}

export async function removeSkill(id: string) {
  const { error } = await supabase.from('skills').delete().eq('id', id)
  if (error) throw error
}

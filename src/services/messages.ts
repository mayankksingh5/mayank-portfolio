import { supabase } from '@/lib/supabase'

/** Public: send a contact form message. Visitors can insert but never read messages. */
export async function sendContactMessage(message: { name: string; email: string; message: string }) {
  const { error } = await supabase.from('contact_messages').insert(message)
  if (error) throw error
}

export async function listMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function setMessageRead(id: string, isRead: boolean) {
  const { error } = await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id)
  if (error) throw error
}

export async function deleteMessage(id: string) {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) throw error
}

export async function countUnreadMessages() {
  const { count, error } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)
  if (error) throw error
  return count ?? 0
}

import { publicDb } from '@/lib/publicDb'

/** Public: send a contact form message. Visitors can insert but never read messages. */
export async function sendContactMessage(message: { name: string; email: string; message: string }) {
  const { error } = await publicDb.from('contact_messages').insert(message)
  if (error) throw error
}

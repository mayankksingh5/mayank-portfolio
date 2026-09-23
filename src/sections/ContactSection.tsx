import { useState, type FormEvent, type ReactNode } from 'react'
import { externalLinkProps, primaryButton, secondaryButton } from '@/components/buttonStyles'
import { CheckIcon, DownloadIcon, EmailIcon, SendIcon, SocialIcon } from '@/components/icons'
import { useReveal } from '@/hooks/useReveal'
import { displayUrl } from '@/lib/format'
import { sendContactMessage } from '@/services/contact'
import type { SocialLink } from '@/types/database'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg outline-none transition-all duration-200 placeholder:text-fg-subtle focus:border-brand/60 aria-invalid:border-red-400/70'

export function ContactSection({
  email,
  socialLinks,
  resumeUrl,
}: {
  email: string | null
  socialLinks: SocialLink[]
  resumeUrl: string | null
}) {
  const ref = useReveal<HTMLElement>()
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'message', string>>>({})

  const contactLinks = [
    ...(email ? [{ key: 'email', label: 'Email', url: `mailto:${email}`, icon: <EmailIcon /> }] : []),
    ...socialLinks
      .filter((link) => link.platform !== 'email')
      .map((link) => ({
        key: link.id,
        label: link.label,
        url: link.url,
        icon: <SocialIcon platform={link.platform} />,
      })),
  ]
  const connectUrl =
    socialLinks.find((link) => link.platform === 'linkedin')?.url ?? (email ? `mailto:${email}` : null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    // Honeypot: real visitors never fill this hidden field.
    if (String(data.get('company') ?? '')) {
      setStatus('sent')
      return
    }

    const values = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    }
    const nextErrors: typeof errors = {}
    if (!values.name) nextErrors.name = 'Please enter your name.'
    else if (values.name.length > 100) nextErrors.name = 'Name is too long.'
    if (!EMAIL_PATTERN.test(values.email)) nextErrors.email = 'Please enter a valid email address.'
    if (!values.message) nextErrors.message = 'Please write a message.'
    else if (values.message.length > 5000) nextErrors.message = 'Message is too long (5000 characters max).'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('sending')
    try {
      await sendContactMessage(values)
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-heading" className="reveal relative z-10 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <p className="mb-3 font-mono text-sm text-brand">// get in touch</p>
            <h2
              id="contact-heading"
              className="text-gradient mb-4 font-display text-[clamp(2rem,5vw,3rem)] font-bold"
            >
              Let&apos;s Build Something Great.
            </h2>
            <p className="mx-auto max-w-lg text-base text-fg-muted">
              I&apos;m interested in opportunities across DevOps, Cloud Engineering and Software Development.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {connectUrl && (
                <a href={connectUrl} {...externalLinkProps(connectUrl)} className={primaryButton}>
                  Let&apos;s Connect
                </a>
              )}
              {resumeUrl && (
                <a href={resumeUrl} className={secondaryButton}>
                  <DownloadIcon /> Download Resume
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="mb-4 text-sm font-semibold tracking-widest text-fg-subtle uppercase">Contact Info</h3>
              <ul className="space-y-4">
                {contactLinks.map((link) => (
                  <li key={link.key}>
                    <a
                      href={link.url}
                      {...externalLinkProps(link.url)}
                      className="glass flex items-center gap-4 rounded-xl border-white/7! p-4 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand"
                      >
                        {link.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs text-fg-subtle">{link.label}</span>
                        <span className="block truncate text-sm text-fg">{displayUrl(link.url)}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="mb-5 text-sm font-semibold tracking-widest text-fg-subtle uppercase">Send a Message</h3>
              {status === 'sent' ? (
                <div role="status" className="flex h-48 flex-col items-center justify-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
                    <CheckIcon size={20} />
                  </span>
                  <p className="text-sm text-success">Message sent successfully!</p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="text-xs text-fg-subtle underline-offset-4 hover:text-white hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <Field id="contact-name" label="Your Name" error={errors.name}>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your Name"
                      maxLength={100}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="contact-email" label="Your Email" error={errors.email}>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Your Email"
                      maxLength={254}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="contact-message" label="Your Message" error={errors.message}>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      placeholder="Your Message"
                      maxLength={5000}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                  {/* Honeypot field, hidden from people and assistive tech. */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor="contact-company">Company</label>
                    <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                  </div>
                  {status === 'error' && (
                    <p role="alert" className="text-sm text-red-400">
                      Sorry, your message could not be sent. Please try again or email me directly.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className={`${primaryButton} w-full disabled:cursor-wait disabled:opacity-70`}
                  >
                    <SendIcon /> {status === 'sending' ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

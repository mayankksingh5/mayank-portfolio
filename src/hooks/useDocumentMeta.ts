import { useEffect } from 'react'

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

/**
 * Keeps <title>, description and Open Graph tags in sync with Admin > Settings.
 * index.html holds the same defaults for crawlers that don't run JavaScript.
 */
export function useDocumentMeta({
  title,
  description,
  image,
}: {
  title?: string
  description?: string
  image?: string | null
}) {
  useEffect(() => {
    if (title) {
      document.title = title
      setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    }
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description)
      setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    }
    if (image) setMeta('meta[property="og:image"]', 'property', 'og:image', image)
  }, [title, description, image])
}

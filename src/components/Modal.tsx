import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import './Modal.css'

export type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  /** A short description; omit for complex content such as lists or tables. */
  description?: string
  children: ReactNode
  initialFocusRef?: RefObject<HTMLElement | null>
  /** Fallback when the element that opened the modal has been removed. */
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function Modal({
  open, onClose, title, description, children,
  initialFocusRef, returnFocusRef,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return

    const opener = document.activeElement instanceof HTMLElement
      ? document.activeElement : null
    const fallback = returnFocusRef?.current
    // showModal(), rather than the `open` attribute, makes the background inert.
    dialog.showModal()
    const initial = initialFocusRef?.current
    if (initial && dialog.contains(initial)) initial.focus()
    if (!initial || document.activeElement !== initial) titleRef.current?.focus()

    return () => {
      dialog.close()
      if (opener?.isConnected) opener.focus({ preventScroll: true })
      if (document.activeElement !== opener && fallback?.isConnected) {
        fallback.focus({ preventScroll: true })
      }
    }
  }, [open, initialFocusRef, returnFocusRef])

  function containTab(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab' || event.defaultPrevented) return
    const dialog = event.currentTarget
    // Recompute on every Tab so added, disabled, or hidden controls are handled.
    const stops = Array.from(dialog.querySelectorAll<HTMLElement>('*'))
      .filter(el => el.tabIndex >= 0 && !el.matches(':disabled') &&
        !el.closest('[inert]') && el.getClientRects().length > 0 &&
        getComputedStyle(el).visibility === 'visible')
      .sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity))
    const first = stops[0]
    const last = stops[stops.length - 1]
    const active = document.activeElement
    if (!first) {
      event.preventDefault()
      titleRef.current?.focus()
    } else if (event.shiftKey && (active === first || !stops.includes(active as HTMLElement))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="accessible-modal"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={containTab}
      onCancel={event => {
        event.preventDefault()
        onClose()
      }}
      onClose={event => {
        // Also synchronize forms using method="dialog" with the controlled prop.
        if (open && !event.currentTarget.open) onClose()
      }}
    >
      <h2 ref={titleRef} id={titleId} tabIndex={-1}>{title}</h2>
      {description && <p id={descriptionId}>{description}</p>}
      {children}
      <button type="button" onClick={onClose}>Close</button>
    </dialog>
  )
}

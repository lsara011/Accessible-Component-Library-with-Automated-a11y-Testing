import './Button2.css'

export type Button2Props = {
  label: string
  disabled?: boolean
  onClick?: () => void
}

export function Button2({
  label,
  disabled = false,
  onClick,
}: Button2Props) {
  return (
    <button type="button" className='border p-3 rounded-2xl font-raleway text-green-400 bg-blue-900 disabled:cursor-not-allowed disabled:text-white disabled:bg-gray-300' disabled={disabled} onClick={onClick}>
      {label}
    </button>
  )
}
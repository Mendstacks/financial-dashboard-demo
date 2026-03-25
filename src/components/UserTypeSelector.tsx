import { usePortfolioStore, type UserType } from '../store/usePortfolioStore'

const USER_TYPES: { value: UserType; label: string }[] = [
  { value: 'front-office', label: 'Front Office' },
  { value: 'back-office', label: 'Back Office' },
]

export function UserTypeSelector() {
  const userType = usePortfolioStore((s) => s.userType)
  const switchUserType = usePortfolioStore((s) => s.switchUserType)

  return (
    <select
      value={userType}
      onChange={(e) => switchUserType(e.target.value as UserType)}
      className="bg-terminal-surface text-terminal-text border border-terminal-border rounded px-2 py-1 text-[10px] cursor-pointer outline-none focus:border-terminal-orange"
    >
      {USER_TYPES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  )
}

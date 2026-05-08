interface BadgeProps {
  label: string;
  color?: string;
  active?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export default function Badge({ label, color, active = true, onClick, small = false }: BadgeProps) {
  const base = small ? 'px-1.5 py-0 text-xs' : 'px-2 py-0.5 text-xs';
  const clickable = onClick
    ? 'cursor-pointer hover:opacity-80 transition-opacity'
    : '';

  return (
    <span
      onClick={onClick}
      className={`${base} rounded-full font-medium inline-flex items-center gap-1 whitespace-nowrap ${clickable} ${
        active
          ? color || 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-400 line-through'
      }`}
    >
      {label}
    </span>
  );
}

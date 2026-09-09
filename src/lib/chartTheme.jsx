export const AXIS_STYLE = { fontSize: 11, fill: '#64748b' }
export const GRID_STYLE = { strokeDasharray: '3 3', stroke: '#e2e8f0', strokeOpacity: 0.6 }

export const COLORS = {
  primary:   '#3b82f6',
  secondary: '#06b6d4',
  brand:     '#8b5cf6',
  success:   '#22c55e',
  warning:   '#f59e0b',
  danger:    '#ef4444',
  purple:    '#a78bfa',
  slate:     '#64748b',
  teal:      '#14b8a6',
  rose:      '#f43f5e',
}

export const PALETTE = [
  COLORS.primary, COLORS.success, COLORS.warning,
  COLORS.brand, COLORS.purple, COLORS.secondary, COLORS.rose,
]

export function Tip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="tooltip_surface_card chart_theme_tooltip" data-name="chart_theme_tooltip">
      <div className="tooltip_date_label chart_theme_tooltip_label" data-name="chart_theme_tooltip_label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-sm font-mono font-semibold mt-1" data-name="chart_theme_tooltip_name_to_fixed_unit_value" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{unit ? ` ${unit}` : ''}
        </div>
      ))}
    </div>
  )
}

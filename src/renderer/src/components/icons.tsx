const base = {
  width: 14,
  height: 14,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true
}

export const PencilIcon = (): React.JSX.Element => (
  <svg {...base}>
    <path d="M10.5 2.5l3 3L5 14H2v-3z" />
  </svg>
)

export const TrashIcon = (): React.JSX.Element => (
  <svg {...base}>
    <path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 8.5h6.6l.7-8.5" />
  </svg>
)

export const PlusIcon = (): React.JSX.Element => (
  <svg {...base}>
    <path d="M8 3v10M3 8h10" />
  </svg>
)

export const FolderIcon = (): React.JSX.Element => (
  <svg {...base}>
    <path d="M2 4.5V12a1 1 0 001 1h10a1 1 0 001-1V6.5a1 1 0 00-1-1H8L6.8 4H3a1 1 0 00-1 .5z" />
  </svg>
)

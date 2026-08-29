export type PinSide = 'top' | 'bottom' | 'left' | 'right'

export const PIN_COPY: Record<string, { label: string; side: PinSide }> = {
  dublin: { label: 'Dublin', side: 'bottom' },
  'dub-airport': { label: 'DUB airport', side: 'top' },
  galway: { label: 'Galway', side: 'left' },
  clonmacnoise: { label: 'Clonmacnoise', side: 'top' },
  aughnanure: { label: 'Aughnanure', side: 'left' },
  kylemore: { label: 'Kylemore', side: 'top' },
  dunguaire: { label: 'Dunguaire', side: 'left' },
  kilmacduagh: { label: 'Kilmacduagh', side: 'bottom' },
  athenry: { label: 'Athenry', side: 'right' },
  carton: { label: 'Carton', side: 'bottom' },
  'maynooth-castle': { label: 'Maynooth', side: 'top' },
  kilkenny: { label: 'Kilkenny', side: 'bottom' },
}

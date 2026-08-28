import { useEffect, useRef, useState } from 'react'
import {
  days,
  isPlaceVisible,
  LINKS,
  mapsUrl,
  placeTone,
  places,
  resolveDay,
  routeStops,
  type GalwayTransport,
  type SaturdayPath,
} from './data'
import { hotelStays, RATE_CHECKED, stayMaps } from './hotels'
import { commonsFilePath, photos, type PhotoId } from './photos'
import { TripMap } from './TripMap'

const STORAGE_KEY = 'ireland-oct-2026-plan'

function loadPrefs(): { transport: GalwayTransport; saturday: SaturdayPath } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { transport: 'drive', saturday: 'connemara' }
    const parsed = JSON.parse(raw) as { transport?: string; saturday?: string }
    return {
      transport: parsed.transport === 'train' ? 'train' : 'drive',
      saturday: parsed.saturday === 'south' ? 'south' : 'connemara',
    }
  } catch {
    return { transport: 'drive', saturday: 'connemara' }
  }
}

function dayFromHash() {
  const hash = window.location.hash.replace('#', '')
  if (days.some((d) => d.id === hash)) return hash
  const place = places.find((p) => p.id === hash)
  return place?.dayId ?? 'oct-1'
}

export default function App() {
  const [prefs] = useState(loadPrefs)
  const [dayId, setDayId] = useState(dayFromHash)
  const [transport, setTransport] = useState<GalwayTransport>(prefs.transport)
  const [saturday, setSaturday] = useState<SaturdayPath>(prefs.saturday)
  const [placeId, setPlaceId] = useState<string | null>(null)
  const [openDays, setOpenDays] = useState<string[]>([dayFromHash()])
  const panelRef = useRef<HTMLElement>(null)

  const day = days.find((d) => d.id === dayId) ?? days[1]
  const resolved = resolveDay(day, transport, saturday)
  const visiblePlaces = places.filter((p) => isPlaceVisible(p, transport, saturday))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transport, saturday }))
  }, [transport, saturday])

  useEffect(() => {
    const onHash = () => {
      const next = dayFromHash()
      setDayId(next)
      setOpenDays((prev) => (prev.includes(next) ? prev : [...prev, next]))
      const hash = window.location.hash.replace('#', '')
      if (places.some((p) => p.id === hash)) setPlaceId(hash)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function selectDay(id: string, opts?: { scroll?: boolean }) {
    setDayId(id)
    setOpenDays((prev) => (prev.includes(id) ? prev : [...prev, id]))
    history.replaceState(null, '', `#${id}`)
    if (opts?.scroll) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function selectPlace(id: string) {
    const place = places.find((p) => p.id === id)
    if (!place) return
    setPlaceId(id)
    selectDay(place.dayId)
    history.replaceState(null, '', `#${id}`)
    document.getElementById(`place-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function toggleCard(id: string) {
    setOpenDays((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
    selectDay(id)
  }

  return (
    <div className="relative min-h-dvh bg-[color:var(--color-cream)] text-[color:var(--color-ink)]">
      <Hero />

      <div className="sticky top-0 z-40 border-b border-[#d9cbb0] bg-[color:var(--color-cream)]/92 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <DayScroller dayId={dayId} onSelect={(id) => selectDay(id, { scroll: true })} />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-24">
        <section className="grid gap-4 py-5 md:grid-cols-2">
          <ToggleCard
            label="Galway, Fri–Sun"
            a={{ id: 'drive', title: 'We’ll drive', note: 'Car Friday morning, drop Sunday in Dublin. Ruin stops on the M6.' }}
            b={{ id: 'train', title: 'Train, no car', note: 'Heuston ↔ Ceannt. Skip the on-the-way ruins. Connemara by coach.' }}
            value={transport}
            onChange={setTransport}
          />
          <ToggleCard
            label="Saturday — pick one loop"
            a={{ id: 'connemara', title: 'Connemara', note: 'Aughnanure Castle, then Kylemore Abbey. Mountains. Recommended.' }}
            b={{ id: 'south', title: 'South', note: 'Dunguaire at Kinvara and Kilmacduagh near Gort. Ruins and the bay.' }}
            value={saturday}
            onChange={setSaturday}
          />
        </section>

        <p className="mb-8 text-center text-[13px] text-[color:var(--color-stone)]">
          {transport === 'drive'
            ? 'Driving: Clonmacnoise on Friday, Athenry on Sunday. Saturday is only the loop you picked.'
            : 'Trains: no Clonmacnoise on the way. Athenry is an optional local hop from Galway. Saturday Connemara is a coach if we stay car-free.'}{' '}
          The two Saturdays do not both happen. Unused Saturday pins stay on the map, dimmed.
        </p>

        <section ref={panelRef} id="day-panel" className="scroll-mt-28">
          <DayPanel
            day={day}
            resolved={resolved}
            onPlace={selectPlace}
          />
        </section>

        <section className="mt-14">
          <SectionHead
            kicker="The shape of the trip"
            title="Dublin → Galway → Dublin → Maynooth → Kilkenny → Dublin → airport"
          />
          <RouteStrip dayId={dayId} onSelect={selectDay} />
        </section>

        <section className="mt-14">
          <SectionHead kicker="Where this goes" title="A map of the nights and the ruins" />
          <TripMap
            transport={transport}
            saturday={saturday}
            selectedPlaceId={placeId}
            onSelectPlace={selectPlace}
          />
        </section>

        <section className="mt-14">
          <SectionHead kicker="Each day" title="Sleep, move, a few official doors" />
          <div className="flex flex-col gap-3">
            {days.map((d) => {
              const block = resolveDay(d, transport, saturday)
              const open = openDays.includes(d.id)
              const active = d.id === dayId
              return (
                <article
                  key={d.id}
                  className={`overflow-hidden rounded-2xl border ${
                    active
                      ? 'border-[color:var(--color-gold)] bg-white/40'
                      : 'border-[#d9cbb0] bg-[color:var(--color-paper)]/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCard(d.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    aria-expanded={open}
                  >
                    <span className="w-14 shrink-0 font-mono text-[11px] tracking-wide text-[color:var(--color-gold-dim)]">
                      {d.weekday} {d.dayNum}
                    </span>
                    <span className="font-display text-lg leading-tight">{d.title}</span>
                    <span className="ml-auto text-[12px] text-[color:var(--color-stone)]">{d.city}</span>
                  </button>
                  {open && (
                    <div className="space-y-3 border-t border-[#d9cbb0] px-4 py-4 text-[15px] leading-relaxed">
                      {block.placeIds.map((id) => {
                        const place = places.find((item) => item.id === id)
                        if (!place?.photoId) return null
                        return (
                          <PlacePhoto
                            key={id}
                            id={place.photoId}
                            alt={`${place.name}, ${place.kind}`}
                          />
                        )
                      })}
                      <p>
                        <span className="font-medium">Sleep. </span>
                        {block.sleep}
                      </p>
                      <p>
                        <span className="font-medium">Move. </span>
                        {block.move}
                      </p>
                      {block.eat && (
                        <p>
                          <span className="font-medium">Eat / drink. </span>
                          {block.eat}
                        </p>
                      )}
                      <LinkRow links={block.links} />
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        <section className="mt-14">
          <SectionHead kicker="Places" title="Official pages and a map pin each" />
          <div className="grid gap-4 md:grid-cols-2">
            {visiblePlaces.map((place) => (
              <article
                key={place.id}
                id={`place-${place.id}`}
                className={`rounded-2xl border p-5 ${
                  placeId === place.id
                    ? 'border-[color:var(--color-gold)] bg-white/50'
                    : 'border-[#d9cbb0] bg-[color:var(--color-paper)]/40'
                } ${placeTone(place, transport, saturday) === 'dim' ? 'opacity-55' : ''}`}
              >
                {place.photoId && (
                  <div className="mb-4">
                    <PlacePhoto id={place.photoId} alt={`${place.name}, ${place.kind}`} />
                  </div>
                )}
                <button
                  type="button"
                  className="text-left"
                  onClick={() => selectPlace(place.id)}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-gold-dim)]">
                    {place.kind}
                  </p>
                  <h3 className="font-display mt-1 text-2xl">{place.name}</h3>
                </button>
                <p className="mt-2 text-[15px] leading-relaxed text-[#3f382e]">{place.blurb}</p>
                {place.hours && (
                  <p className="mt-2 text-[13px] text-[color:var(--color-stone)]">{place.hours}</p>
                )}
                <div className="mt-4">
                  <LinkRow
                    links={[
                      place.official,
                      { label: 'Google Maps', href: mapsUrl(place.mapsQuery) },
                      ...(place.extraLinks ?? []),
                    ]}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <Hotels />

        <Flights />
      </main>

      <footer className="border-t border-[#d9cbb0] bg-[color:var(--color-peat)] px-4 py-12 text-[color:var(--color-cream)]">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-3xl italic">Draft plan, nothing booked except the flights.</p>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#d7cbb4]">
            A briefing for two, to tap through on a phone. No booking references, no home addresses, no
            work agenda. Last updated August 2026. Times are Ireland local (IST, UTC+1 in early October)
            unless marked PT.
          </p>
          <p className="mt-6 font-mono text-[11px] tracking-wide text-[color:var(--color-gold)]">
            Share the link · keep it unofficial · check hours before we go
          </p>
        </div>
      </footer>
    </div>
  )
}

function Hero() {
  return (
    <header className="relative overflow-hidden bg-[color:var(--color-peat)] text-[color:var(--color-cream)]">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
        <Hills />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-[calc(1.5rem+env(safe-area-inset-top))] md:pb-24 md:pt-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-gold)]">
          30 Sep – 12 Oct 2026 · Ireland
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-[2.7rem] leading-[1.05] md:text-7xl">
          Early October,
          <span className="italic text-[color:var(--color-gold)]"> west of Dublin.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#e4d8c0]">
          A shareable briefing for a couple. Twelve days on the island: a quiet landing, Galway with
          friends, a work summit at Carton House, one night under Kilkenny Castle, then a Dublin
          weekend. Tap a day. Open the official doors.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-[13px] text-[#d7cbb4]">
          <span className="rounded-full border border-[color:var(--color-gold)]/40 px-3 py-1">
            No login
          </span>
          <span className="rounded-full border border-[color:var(--color-gold)]/40 px-3 py-1">
            Flights held · hotels not
          </span>
          <span className="rounded-full border border-[color:var(--color-gold)]/40 px-3 py-1">
            IST on the ground
          </span>
        </div>
      </div>
    </header>
  )
}

function Hills() {
  return (
    <svg viewBox="0 0 800 420" className="h-full w-full" preserveAspectRatio="xMidYMax slice">
      <path d="M0 280 C120 240 180 300 300 260 C420 220 480 300 620 250 C700 220 760 260 800 240 V420 H0 Z" fill="#1d2e22" />
      <path d="M0 320 C160 280 220 340 360 300 C500 260 560 330 800 290 V420 H0 Z" fill="#24382b" />
      <path d="M40 210 C80 170 90 210 70 230 C55 245 30 235 40 210 Z" fill="#c9a45a" opacity="0.55" />
    </svg>
  )
}

function DayScroller({
  dayId,
  onSelect,
}: {
  dayId: string
  onSelect: (id: string) => void
}) {
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scroller.current?.querySelector<HTMLElement>(`[data-day="${dayId}"]`)
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [dayId])

  return (
    <div
      ref={scroller}
      className="day-scroll flex gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Days of the trip"
    >
      {days.map((d) => {
        const active = d.id === dayId
        return (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-day={d.id}
            onClick={() => onSelect(d.id)}
            className={`shrink-0 rounded-full px-3 py-2 text-left transition ${
              active
                ? 'bg-[color:var(--color-peat)] text-[color:var(--color-cream)]'
                : 'bg-[#e6d9c0] text-[color:var(--color-ink)]'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-wider opacity-70">
              {d.weekday}
            </span>
            <span className="block font-display text-lg leading-none">
              {d.dayNum} {d.month}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ToggleCard<T extends string>({
  label,
  a,
  b,
  value,
  onChange,
}: {
  label: string
  a: { id: T; title: string; note: string }
  b: { id: T; title: string; note: string }
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="rounded-2xl border border-[#d9cbb0] bg-[color:var(--color-paper)]/70 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-gold-dim)]">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[a, b].map((opt) => {
          const on = value === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-xl px-3 py-3 text-left ${
                on
                  ? 'bg-[color:var(--color-peat)] text-[color:var(--color-cream)]'
                  : 'bg-white/50 text-[color:var(--color-ink)]'
              }`}
            >
              <span className="block font-display text-lg leading-tight">{opt.title}</span>
              <span className={`mt-1 block text-[12px] leading-snug ${on ? 'text-[#d7cbb4]' : 'text-[color:var(--color-stone)]'}`}>
                {opt.note}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-gold-dim)]">
        {kicker}
      </p>
      <h2 className="font-display mt-1 text-3xl leading-tight md:text-4xl">{title}</h2>
    </div>
  )
}

function DayPanel({
  day,
  resolved,
  onPlace,
}: {
  day: (typeof days)[number]
  resolved: ReturnType<typeof resolveDay>
  onPlace: (id: string) => void
}) {
  return (
    <article className="rounded-[28px] bg-[color:var(--color-peat)] px-5 py-8 text-[color:var(--color-cream)] md:px-10 md:py-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-gold)]">
        {day.weekday} {day.dayNum} {day.month} · {resolved.kicker}
      </p>
      <h2 className="font-display mt-3 text-4xl leading-tight md:text-5xl">{resolved.title}</h2>
      <p className="mt-2 text-[15px] text-[#d7cbb4]">{resolved.city}</p>
      <div className="gold-rule my-6" />
      {resolved.placeIds.map((id) => {
        const place = places.find((item) => item.id === id)
        if (!place?.photoId) return null
        return (
          <div key={id} className="mb-5">
            <PlacePhoto id={place.photoId} alt={`${place.name}, ${place.kind}`} />
          </div>
        )
      })}
      <dl className="grid gap-6 md:grid-cols-3">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-gold)]">
            Sleep
          </dt>
          <dd className="mt-2 text-[16px] leading-relaxed">{resolved.sleep}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-gold)]">
            Move
          </dt>
          <dd className="mt-2 text-[16px] leading-relaxed">{resolved.move}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-gold)]">
            Eat / drink
          </dt>
          <dd className="mt-2 text-[16px] leading-relaxed">
            {resolved.eat ?? 'Nothing named. We will decide on the ground.'}
          </dd>
        </div>
      </dl>
      {resolved.notes.length > 0 && (
        <ul className="mt-6 space-y-2 text-[15px] leading-relaxed text-[#e4d8c0]">
          {resolved.notes.map((note) => (
            <li key={note} className="pl-4">
              — {note}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <LinkRow links={resolved.links} invert />
      </div>
      {resolved.placeIds.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {resolved.placeIds.map((id) => {
            const place = places.find((p) => p.id === id)
            if (!place) return null
            return (
              <button
                key={id}
                type="button"
                onClick={() => onPlace(id)}
                className="rounded-full border border-[color:var(--color-gold)]/50 px-3 py-1 text-[13px] text-[color:var(--color-gold)]"
              >
                {place.name} on the map
              </button>
            )
          })}
        </div>
      )}
    </article>
  )
}

function RouteStrip({
  dayId,
  onSelect,
}: {
  dayId: string
  onSelect: (id: string) => void
}) {
  return (
    <ol className="day-scroll flex items-stretch gap-0 overflow-x-auto rounded-2xl border border-[#d9cbb0] bg-[color:var(--color-paper)]/60 p-3">
      {routeStops.map((stop, i) => {
        const active = stop.dayId === dayId
        return (
          <li key={stop.id} className="flex shrink-0 items-center">
            {i > 0 && (
              <span className="mx-1 h-px w-6 bg-[color:var(--color-gold)] md:w-10" aria-hidden />
            )}
            <button
              type="button"
              onClick={() => onSelect(stop.dayId)}
              className={`rounded-full px-3 py-2 font-display text-sm md:text-base ${
                active
                  ? 'bg-[color:var(--color-peat)] text-[color:var(--color-cream)]'
                  : 'text-[color:var(--color-ink)]'
              }`}
            >
              {stop.label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function LinkRow({ links, invert = false }: { links: { label: string; href: string }[]; invert?: boolean }) {
  if (links.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link) => (
        <li key={link.href + link.label}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex rounded-full border px-3 py-1.5 text-[13px] underline-offset-2 hover:underline ${
              invert
                ? 'border-[color:var(--color-gold)]/45 text-[color:var(--color-cream)]'
                : 'border-[#c4b496] bg-white/40'
            }`}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function PlacePhoto({ id, alt }: { id: PhotoId; alt: string }) {
  const photo = photos[id]
  const [src, setSrc] = useState(photo.src)
  return (
    <figure>
      <img
        src={src}
        alt={alt}
        className="place-photo"
        onError={() => {
          const remote = commonsFilePath(photo.source)
          if (src !== remote) setSrc(remote)
        }}
      />
      <figcaption className="photo-credit">
        {photo.artist} · {photo.license} ·{' '}
        <a href={photo.source} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
          Wikimedia Commons
        </a>
      </figcaption>
    </figure>
  )
}

function Hotels() {
  return (
    <section className="mt-14">
      <SectionHead kicker="Where we might sleep" title="Hotels to check, nothing booked" />
      <p className="mb-6 max-w-3xl text-[15px] leading-relaxed text-[#3f382e]">
        Flights are held. Hotels are not. Galway is the friends’ house. Rates below are not quoted —
        hotel widgets are login-walled or change by the hour. Each button opens the official site or
        Booking.com with the exact stay dates ({RATE_CHECKED} snapshot: links only).
      </p>
      <div className="flex flex-col gap-6">
        {hotelStays.map((stay) => (
          <article key={stay.id} className="rounded-[22px] border border-[#d9cbb0] bg-[color:var(--color-paper)]/50 p-5 md:p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-gold-dim)]">
              {stay.nights}
            </p>
            <h3 className="font-display mt-1 text-2xl md:text-3xl">{stay.city}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#3f382e]">{stay.why}</p>
            {stay.friendsHouse && (
              <p className="mt-3 text-[13px] text-[color:var(--color-stone)]">
                No booking link. Downtown Galway — address stays off this page.
              </p>
            )}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {stay.picks.map((pick) => (
                <div key={pick.id} className="rounded-2xl border border-[#d9cbb0] bg-white/40 p-4">
                  {pick.photoId && (
                    <div className="mb-3">
                      <PlacePhoto
                        id={pick.photoId}
                        alt={`${pick.name}${pick.photoId === 'kilkenny' ? ' area — Kilkenny Castle' : pick.photoId === 'dublin' ? ' area — Dublin Docklands' : pick.photoId === 'dean' ? ' neighbourhood — Camden Street' : pick.photoId === 'marker' ? ' neighbourhood — Grand Canal Theatre' : ''}`}
                      />
                    </div>
                  )}
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-gold-dim)]">
                    {pick.role === 'pick' ? 'Pick' : 'Alternative'}
                  </p>
                  <h4 className="font-display mt-1 text-xl">{pick.name}</h4>
                  <p className="mt-2 text-[14px] leading-relaxed">{pick.note}</p>
                  <p className="mt-2 text-[13px] text-[color:var(--color-stone)]">{pick.walk}</p>
                  {pick.amexFhr && (
                    <p className="mt-2 text-[13px] text-[color:var(--color-stone)]">
                      Amex Fine Hotels + Resorts if booked through Amex Travel. No nightly rate on this page.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={pick.official.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-[#c4b496] bg-[color:var(--color-peat)] px-3 py-1.5 text-[13px] text-[color:var(--color-cream)]"
                    >
                      Official · {pick.official.label}
                    </a>
                    {pick.bookDirect && (
                      <a
                        href={pick.bookDirect.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full border border-[#c4b496] bg-white/50 px-3 py-1.5 text-[13px]"
                      >
                        {pick.bookDirect.label}
                      </a>
                    )}
                    <a
                      href={pick.booking}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-[#c4b496] bg-white/50 px-3 py-1.5 text-[13px]"
                    >
                      Check live rate · Booking.com · {stay.dates}
                    </a>
                    <a
                      href={stayMaps(pick.mapsQuery)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-[#c4b496] bg-white/50 px-3 py-1.5 text-[13px]"
                    >
                      Google Maps
                    </a>
                  </div>
                  <p className="mt-3 text-[11px] text-[color:var(--color-stone)]">
                    No price quoted. Open the official engine or Booking.com (as of {RATE_CHECKED}).
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Flights() {
  return (
    <section className="mt-14 rounded-[28px] border border-[#d9cbb0] bg-[color:var(--color-paper)]/70 p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-gold-dim)]">
        Flights · times only
      </p>
      <h2 className="font-display mt-2 text-3xl md:text-4xl">Across the Atlantic, twice</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="font-mono text-[12px] text-[color:var(--color-gold-dim)]">Out · AA 8324</p>
          <p className="font-display mt-1 text-2xl">Aer Lingus / American</p>
          <p className="mt-2 text-[15px] leading-relaxed">
            SFO Wed 30 Sep 2026, 5:40pm PT → DUB Thu 1 Oct, 11:45am local. About 10 hours.
          </p>
        </div>
        <div>
          <p className="font-mono text-[12px] text-[color:var(--color-gold-dim)]">Back · AA 8325</p>
          <p className="font-display mt-1 text-2xl">American</p>
          <p className="mt-2 text-[15px] leading-relaxed">
            DUB Mon 12 Oct, 12:50pm local → SFO 3:50pm PT the same day. About 11 hours. Airport that
            morning; leave the hotel around 9–9:30am.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <LinkRow
          links={[
            { label: 'SFO', href: LINKS.sfo },
            { label: 'Dublin Airport', href: LINKS.dubAirport },
            { label: 'Map · SFO', href: mapsUrl('San Francisco International Airport') },
            { label: 'Map · Dublin Airport', href: mapsUrl('Dublin Airport DUB') },
            { label: 'Aer Lingus', href: LINKS.aerLingus },
            { label: 'American Airlines', href: LINKS.aa },
          ]}
        />
      </div>
    </section>
  )
}

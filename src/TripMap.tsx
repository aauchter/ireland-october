import { GeoJSONSource, LngLatBounds, Map as MapLibreMap, Marker, NavigationControl, Popup } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import {
  isPlaceVisible,
  places,
  type GalwayTransport,
  type SaturdayPath,
} from './data'

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'

type Props = {
  transport: GalwayTransport
  saturday: SaturdayPath
  selectedPlaceId: string | null
  onSelectPlace: (id: string) => void
}

function visiblePlaces(transport: GalwayTransport, saturday: SaturdayPath) {
  return places.filter((p) => isPlaceVisible(p, transport, saturday))
}

function routeGeoJSON(transport: GalwayTransport) {
  const dublin: [number, number] = [-6.2603, 53.3498]
  const galway: [number, number] = [-9.0568, 53.2707]
  const clonmacnoise: [number, number] = [-7.9861, 53.3267]
  const athenry: [number, number] = [-8.7447, 53.3006]
  const carton: [number, number] = [-6.5615, 53.3785]
  const kilkenny: [number, number] = [-7.2522, 52.6541]
  const airport: [number, number] = [-6.2701, 53.4264]

  const west = transport === 'drive' ? [dublin, clonmacnoise, galway] : [dublin, galway]
  const east = transport === 'drive' ? [galway, athenry, dublin] : [galway, dublin]
  const coords = [...west, ...east.slice(1), carton, kilkenny, dublin, airport]

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: coords },
  }
}

export function TripMap({
  transport,
  saturday,
  selectedPlaceId,
  onSelectPlace,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Marker[]>([])
  const onSelectRef = useRef(onSelectPlace)

  useEffect(() => {
    onSelectRef.current = onSelectPlace
  }, [onSelectPlace])

  useEffect(() => {
    if (!wrapRef.current || mapRef.current) return

    const map = new MapLibreMap({
      container: wrapRef.current,
      style: STYLE,
      center: [-8.1, 53.25],
      zoom: 6.15,
      attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map

    const resize = () => map.resize()
    map.on('load', resize)
    const ro = new ResizeObserver(resize)
    ro.observe(wrapRef.current)
    window.addEventListener('resize', resize)

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [routeGeoJSON('drive')] },
      })
      map.addLayer({
        id: 'route-line-glow',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#c9a45a',
          'line-width': 6,
          'line-opacity': 0.25,
        },
      })
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#24382b',
          'line-width': 2.4,
          'line-dasharray': [2, 1.2],
        },
      })
    })

    return () => {
      window.removeEventListener('resize', resize)
      ro.disconnect()
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const apply = () => {
      const source = map.getSource('route') as GeoJSONSource | undefined
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [routeGeoJSON(transport)],
        })
      }

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const shown = visiblePlaces(transport, saturday)
      const bounds = new LngLatBounds()

      shown.forEach((place) => {
        bounds.extend([place.lng, place.lat])
        const el = document.createElement('button')
        el.type = 'button'
        el.className = `place-marker${place.id === selectedPlaceId ? ' is-active' : ''}`
        el.setAttribute('aria-label', place.name)
        el.innerHTML = `<span class="place-marker-dot"></span><span class="place-marker-label">${place.name}</span>`
        el.addEventListener('click', (event) => {
          event.stopPropagation()
          onSelectRef.current(place.id)
        })
        const marker = new Marker({ element: el, anchor: 'left' })
          .setLngLat([place.lng, place.lat])
          .setPopup(
            new Popup({ offset: 18, closeButton: false }).setHTML(
              `<strong>${place.name}</strong><div style="font-size:12px;opacity:.75">${place.kind}</div>`,
            ),
          )
          .addTo(map)
        markersRef.current.push(marker)
      })

      if (!selectedPlaceId && !bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 56, maxZoom: 7.4, duration: 0 })
      }
    }

    if (map.loaded()) apply()
    else map.once('load', apply)
  }, [transport, saturday, selectedPlaceId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedPlaceId) return
    const place = places.find((p) => p.id === selectedPlaceId)
    if (!place) return
    map.flyTo({ center: [place.lng, place.lat], zoom: 9.2, speed: 0.8 })
  }, [selectedPlaceId])

  return (
    <div className="relative z-[3] isolate overflow-hidden rounded-[22px] border border-[#d9cbb0] bg-[#d7e0d4]">
      <div ref={wrapRef} className="h-[340px] w-full md:h-[460px]" />
      <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-[color:var(--color-peat)]/88 px-3 py-1 text-[11px] tracking-wide text-[color:var(--color-cream)]">
        Tap a pin · OpenStreetMap
      </p>
    </div>
  )
}

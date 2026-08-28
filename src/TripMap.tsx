import {
  GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
} from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import {
  isPlaceVisible,
  places,
  type GalwayTransport,
  type Place,
  type SaturdayPath,
} from './data'

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'

type Props = {
  transport: GalwayTransport
  saturday: SaturdayPath
  selectedPlaceId: string | null
  onSelectPlace: (id: string) => void
}

type PinState = {
  transport: GalwayTransport
  saturday: SaturdayPath
  selectedPlaceId: string | null
}

function visiblePlaces(transport: GalwayTransport, saturday: SaturdayPath) {
  return places.filter((place) => isPlaceVisible(place, transport, saturday))
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
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'LineString' as const, coordinates: coords },
  }
}

function placesGeoJSON(state: PinState) {
  return {
    type: 'FeatureCollection' as const,
    features: visiblePlaces(state.transport, state.saturday).map((place) => ({
      type: 'Feature' as const,
      properties: {
        id: place.id,
        name: place.name,
        kind: place.kind,
        active: place.id === state.selectedPlaceId ? 'yes' : 'no',
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [place.lng, place.lat],
      },
    })),
  }
}

function pinElement(place: Place, active: boolean) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = `place-marker${active ? ' is-active' : ''}`
  el.dataset.placeId = place.id
  el.setAttribute('aria-label', place.name)
  const fill = active ? '#c9a45a' : '#152018'
  el.innerHTML = `<span class="place-marker-label">${place.name}</span><svg class="place-marker-pin" viewBox="0 0 24 36" width="28" height="42" aria-hidden="true"><path fill="${fill}" stroke="#f3ead8" stroke-width="2.2" d="M12 1.6c-5.3 0-9.6 4.2-9.6 9.5 0 7.2 9.6 23.3 9.6 23.3s9.6-16.1 9.6-23.3c0-5.3-4.3-9.5-9.6-9.5z"/><circle cx="12" cy="11" r="3.3" fill="#f3ead8"/></svg>`
  return el
}

function whenStyleReady(map: MapLibreMap, onReady: () => void) {
  let finished = false
  let poll = 0
  const run = () => {
    if (finished) return
    try {
      if (!map.isStyleLoaded()) return
    } catch {
      return
    }
    finished = true
    window.clearInterval(poll)
    onReady()
  }
  map.on('load', run)
  map.on('idle', run)
  poll = window.setInterval(run, 75)
  run()
  return () => {
    finished = true
    window.clearInterval(poll)
    map.off('load', run)
    map.off('idle', run)
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
  const stateRef = useRef<PinState>({ transport, saturday, selectedPlaceId })
  const syncRef = useRef<() => void>(() => {})
  const clicksBound = useRef(false)

  useEffect(() => {
    onSelectRef.current = onSelectPlace
  }, [onSelectPlace])

  useEffect(() => {
    const container = wrapRef.current
    if (!container) return

    const map = new MapLibreMap({
      container,
      style: STYLE,
      center: [-8.1, 53.25],
      zoom: 6.15,
      attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map

    const selectFromMap = (id: unknown) => {
      if (typeof id === 'string' && id.length > 0) onSelectRef.current(id)
    }

    const bindLayerClicks = () => {
      if (clicksBound.current) return
      clicksBound.current = true
      for (const layer of ['places-halo', 'places-core', 'places-label']) {
        map.on('click', layer, (event) => {
          selectFromMap(event.features?.[0]?.properties?.id)
        })
        map.on('mouseenter', layer, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', layer, () => {
          map.getCanvas().style.cursor = ''
        })
      }
    }

    const ensureLayers = () => {
      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [routeGeoJSON(stateRef.current.transport)] },
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
      }

      if (!map.getSource('places')) {
        map.addSource('places', {
          type: 'geojson',
          data: placesGeoJSON(stateRef.current),
        })
        map.addLayer({
          id: 'places-halo',
          type: 'circle',
          source: 'places',
          paint: {
            'circle-radius': 16,
            'circle-color': '#f3ead8',
            'circle-opacity': 0.92,
          },
        })
        map.addLayer({
          id: 'places-core',
          type: 'circle',
          source: 'places',
          paint: {
            'circle-radius': [
              'case',
              ['==', ['get', 'active'], 'yes'],
              11,
              8,
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'active'], 'yes'],
              '#c9a45a',
              '#152018',
            ],
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#f3ead8',
          },
        })
        map.addLayer({
          id: 'places-label',
          type: 'symbol',
          source: 'places',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-offset': [0, 1.35],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#152018',
            'text-halo-color': '#f3ead8',
            'text-halo-width': 1.8,
          },
        })
        bindLayerClicks()
      }
    }

    const sync = () => {
      if (!map.isStyleLoaded()) return
      map.resize()
      ensureLayers()

      const state = stateRef.current
      const routeSource = map.getSource('route') as GeoJSONSource | undefined
      routeSource?.setData({
        type: 'FeatureCollection',
        features: [routeGeoJSON(state.transport)],
      })
      const placesSource = map.getSource('places') as GeoJSONSource | undefined
      placesSource?.setData(placesGeoJSON(state))

      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      const shown = visiblePlaces(state.transport, state.saturday)
      const bounds = new LngLatBounds()

      shown.forEach((place) => {
        bounds.extend([place.lng, place.lat])
        const el = pinElement(place, place.id === state.selectedPlaceId)
        el.addEventListener('click', (event) => {
          event.stopPropagation()
          onSelectRef.current(place.id)
        })
        const marker = new Marker({ element: el, anchor: 'bottom', offset: [0, 2] })
          .setLngLat([place.lng, place.lat])
          .setPopup(
            new Popup({ offset: 22, closeButton: false }).setHTML(
              `<strong>${place.name}</strong><div style="font-size:12px;opacity:.75">${place.kind}</div>`,
            ),
          )
          .addTo(map)
        markersRef.current.push(marker)
      })

      if (!state.selectedPlaceId && !bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 48, maxZoom: 7.2, duration: 0 })
      }
    }

    syncRef.current = sync
    const stopReady = whenStyleReady(map, sync)

    const resize = () => map.resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    window.addEventListener('resize', resize)

    return () => {
      stopReady()
      syncRef.current = () => {}
      window.removeEventListener('resize', resize)
      ro.disconnect()
      clicksBound.current = false
      markersRef.current.forEach((marker) => {
        try {
          marker.remove()
        } catch {
          /* MapLibre can throw if GL never initialized */
        }
      })
      markersRef.current = []
      try {
        map.remove()
      } catch {
        /* MapLibre throws destroy() if WebGL never came up */
      }
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    stateRef.current = { transport, saturday, selectedPlaceId }
    syncRef.current()
  }, [transport, saturday, selectedPlaceId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedPlaceId) return
    const place = places.find((item) => item.id === selectedPlaceId)
    if (!place) return
    map.flyTo({ center: [place.lng, place.lat], zoom: 9.2, speed: 0.8 })
  }, [selectedPlaceId])

  return (
    <div className="relative z-[3] isolate overflow-hidden rounded-[22px] border border-[#d9cbb0] bg-[#d7e0d4]">
      <div ref={wrapRef} className="h-[360px] w-full md:h-[480px]" />
      <p className="pointer-events-none absolute left-3 top-3 z-[2] rounded-full bg-[color:var(--color-peat)]/88 px-3 py-1 text-[11px] tracking-wide text-[color:var(--color-cream)]">
        Tap a pin · OpenStreetMap
      </p>
    </div>
  )
}

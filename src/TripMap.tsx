import { GeoJSONSource, LngLatBounds, Map as MapLibreMap, NavigationControl } from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  placeTone,
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

type PinState = {
  transport: GalwayTransport
  saturday: SaturdayPath
  selectedPlaceId: string | null
}

type Point = { x: number; y: number }

function mapPlaces(transport: GalwayTransport) {
  return places.filter((place) => placeTone(place, transport, 'connemara') !== 'hidden')
}

function routeCoords(transport: GalwayTransport): [number, number][] {
  const dublin: [number, number] = [-6.2603, 53.3498]
  const galway: [number, number] = [-9.0568, 53.2707]
  const clonmacnoise: [number, number] = [-7.9861, 53.3267]
  const athenry: [number, number] = [-8.7447, 53.3006]
  const carton: [number, number] = [-6.5615, 53.3785]
  const kilkenny: [number, number] = [-7.2522, 52.6541]
  const airport: [number, number] = [-6.2701, 53.4264]
  const west = transport === 'drive' ? [dublin, clonmacnoise, galway] : [dublin, galway]
  const east = transport === 'drive' ? [galway, athenry, dublin] : [galway, dublin]
  return [...west, ...east.slice(1), carton, kilkenny, dublin, airport]
}

function routeGeoJSON(transport: GalwayTransport) {
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'LineString' as const, coordinates: routeCoords(transport) },
      },
    ],
  }
}

function placesGeoJSON(state: PinState) {
  return {
    type: 'FeatureCollection' as const,
    features: mapPlaces(state.transport).map((place) => {
      const tone = placeTone(place, state.transport, state.saturday)
      return {
        type: 'Feature' as const,
        id: place.id,
        properties: {
          id: place.id,
          name: place.name,
          kind: place.kind,
          dim: tone === 'dim' ? 'yes' : 'no',
          active: place.id === state.selectedPlaceId ? 'yes' : 'no',
        },
        geometry: { type: 'Point' as const, coordinates: [place.lng, place.lat] },
      }
    }),
  }
}

function pinBounds(transport: GalwayTransport) {
  const pts = mapPlaces(transport)
  const lngs = pts.map((p) => p.lng)
  const lats = pts.map((p) => p.lat)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const padLng = Math.max((maxLng - minLng) * 0.14, 0.35)
  const padLat = Math.max((maxLat - minLat) * 0.16, 0.18)
  return {
    west: minLng - padLng,
    east: maxLng + padLng,
    south: minLat - padLat,
    north: maxLat + padLat,
  }
}

function projectFlat(lng: number, lat: number, width: number, height: number, transport: GalwayTransport): Point {
  const { west, east, south, north } = pinBounds(transport)
  return {
    x: ((lng - west) / (east - west)) * width,
    y: ((north - lat) / (north - south)) * height,
  }
}

export function TripMap({
  transport,
  saturday,
  selectedPlaceId,
  onSelectPlace,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const mapElRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const onSelectRef = useRef(onSelectPlace)
  const stateRef = useRef<PinState>({ transport, saturday, selectedPlaceId })
  const [size, setSize] = useState({ w: 800, h: 420 })
  const [mapReady, setMapReady] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    onSelectRef.current = onSelectPlace
  }, [onSelectPlace])

  useEffect(() => {
    stateRef.current = { transport, saturday, selectedPlaceId }
  }, [transport, saturday, selectedPlaceId])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const measure = () => {
      const rect = frame.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: rect.width, h: rect.height })
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const container = mapElRef.current
    if (!container) return

    let cancelled = false
    let map: MapLibreMap | null = null
    let clicksBound = false

    const ensureLayers = (target: MapLibreMap) => {
      if (!target.isStyleLoaded()) return
      if (!target.getSource('trip-route')) {
        target.addSource('trip-route', { type: 'geojson', data: routeGeoJSON(stateRef.current.transport) })
        target.addLayer({
          id: 'trip-route-glow',
          type: 'line',
          source: 'trip-route',
          paint: { 'line-color': '#c9a45a', 'line-width': 8, 'line-opacity': 0.35 },
        })
        target.addLayer({
          id: 'trip-route-line',
          type: 'line',
          source: 'trip-route',
          paint: { 'line-color': '#152018', 'line-width': 3.2, 'line-dasharray': [1.6, 1.1] },
        })
      }
      if (!target.getSource('trip-places')) {
        target.addSource('trip-places', { type: 'geojson', data: placesGeoJSON(stateRef.current) })
        target.addLayer({
          id: 'trip-places-halo',
          type: 'circle',
          source: 'trip-places',
          paint: {
            'circle-radius': 15,
            'circle-color': '#f3ead8',
            'circle-opacity': ['case', ['==', ['get', 'dim'], 'yes'], 0.35, 0.95],
          },
        })
        target.addLayer({
          id: 'trip-places-core',
          type: 'circle',
          source: 'trip-places',
          paint: {
            'circle-radius': ['case', ['==', ['get', 'active'], 'yes'], 11, 8],
            'circle-color': ['case', ['==', ['get', 'active'], 'yes'], '#c9a45a', '#152018'],
            'circle-opacity': ['case', ['==', ['get', 'dim'], 'yes'], 0.4, 1],
            'circle-stroke-width': 2.4,
            'circle-stroke-color': '#f3ead8',
          },
        })
        target.addLayer({
          id: 'trip-places-label',
          type: 'symbol',
          source: 'trip-places',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-offset': [0, 1.4],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#152018',
            'text-halo-color': '#f3ead8',
            'text-halo-width': 1.8,
            'text-opacity': ['case', ['==', ['get', 'dim'], 'yes'], 0.45, 1],
          },
        })
      }
      const route = target.getSource('trip-route') as GeoJSONSource | undefined
      route?.setData(routeGeoJSON(stateRef.current.transport))
      const pts = target.getSource('trip-places') as GeoJSONSource | undefined
      pts?.setData(placesGeoJSON(stateRef.current))
      if (!clicksBound) {
        clicksBound = true
        for (const layer of ['trip-places-halo', 'trip-places-core', 'trip-places-label']) {
          target.on('click', layer, (event) => {
            const id = event.features?.[0]?.properties?.id
            if (typeof id === 'string') onSelectRef.current(id)
          })
          target.on('mouseenter', layer, () => {
            target.getCanvas().style.cursor = 'pointer'
          })
          target.on('mouseleave', layer, () => {
            target.getCanvas().style.cursor = ''
          })
        }
      }
    }

    const fit = (target: MapLibreMap) => {
      const bounds = new LngLatBounds()
      mapPlaces(stateRef.current.transport).forEach((place) => bounds.extend([place.lng, place.lat]))
      if (!bounds.isEmpty()) {
        target.fitBounds(bounds, { padding: 56, maxZoom: 7.6, duration: 0 })
      }
    }

    try {
      map = new MapLibreMap({
        container,
        style: STYLE,
        center: [-8.05, 53.15],
        zoom: 6.4,
        attributionControl: { compact: true },
      })
    } catch {
      return () => {
        cancelled = true
      }
    }

    mapRef.current = map
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')

    const onReady = () => {
      if (cancelled || !map) return
      try {
        map.resize()
        ensureLayers(map)
        if (!stateRef.current.selectedPlaceId) fit(map)
        setMapReady(true)
        setTick((n) => n + 1)
      } catch {
        setTick((n) => n + 1)
      }
    }

    map.on('load', onReady)
    map.on('idle', onReady)
    map.on('style.load', onReady)
    map.on('move', () => setTick((n) => n + 1))

    const ro = new ResizeObserver(() => {
      map?.resize()
      setTick((n) => n + 1)
    })
    ro.observe(container)

    const poll = window.setInterval(() => {
      if (map && map.isStyleLoaded()) onReady()
    }, 250)

    return () => {
      cancelled = true
      window.clearInterval(poll)
      ro.disconnect()
      try {
        map?.remove()
      } catch {
        /* WebGL never came up */
      }
      mapRef.current = null
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const route = map.getSource('trip-route') as GeoJSONSource | undefined
    route?.setData(routeGeoJSON(transport))
    const pts = map.getSource('trip-places') as GeoJSONSource | undefined
    pts?.setData(placesGeoJSON({ transport, saturday, selectedPlaceId }))
    if (selectedPlaceId) {
      const place = places.find((item) => item.id === selectedPlaceId)
      if (place) map.flyTo({ center: [place.lng, place.lat], zoom: 9, speed: 0.85 })
    } else {
      const bounds = new LngLatBounds()
      mapPlaces(transport).forEach((place) => bounds.extend([place.lng, place.lat]))
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 56, maxZoom: 7.6, duration: 400 })
      }
    }
    setTick((n) => n + 1)
  }, [transport, saturday, selectedPlaceId])

  const shown = useMemo(() => mapPlaces(transport), [transport])
  const route = useMemo(() => routeCoords(transport), [transport])

  const project = (lng: number, lat: number): Point => {
    const map = mapRef.current
    if (map && mapReady) {
      const point = map.project([lng, lat])
      return { x: point.x, y: point.y }
    }
    return projectFlat(lng, lat, size.w, size.h, transport)
  }

  const line = route.map((coord) => {
    const point = project(coord[0], coord[1])
    return `${point.x},${point.y}`
  }).join(' ')

  void tick

  return (
    <div
      className="relative z-[3] isolate overflow-hidden rounded-[22px] border border-[#d9cbb0] bg-[#d7e0d4]"
      data-pin-count={shown.length}
      data-route-points={route.length}
      data-map-ready={mapReady ? 'yes' : 'no'}
    >
      <div ref={frameRef} className="relative h-[380px] w-full md:h-[500px]">
        <div ref={mapElRef} className="absolute inset-0 z-0" />
        <svg
          viewBox={`0 0 ${size.w} ${size.h}`}
          width={size.w}
          height={size.h}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          role="img"
          aria-label="Ireland trip route from Dublin to Galway, Carton House, Kilkenny, and Dublin Airport"
          data-route-layer="svg"
        >
          <polyline
            points={line}
            fill="none"
            stroke="#c9a45a"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
          <polyline
            points={line}
            fill="none"
            stroke="#152018"
            strokeWidth="3.2"
            strokeDasharray="8 6"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-route-line="yes"
          />
        </svg>
        <div className="absolute inset-0 z-20">
          {shown.map((place) => {
            const tone = placeTone(place, transport, saturday)
            const point = project(place.lng, place.lat)
            const active = place.id === selectedPlaceId
            return (
              <button
                key={place.id}
                type="button"
                className={`map-dom-pin${active ? ' is-active' : ''}${tone === 'dim' ? ' is-dim' : ''}`}
                data-place-id={place.id}
                aria-label={place.name}
                style={{ left: `${point.x}px`, top: `${point.y}px` }}
                onClick={() => onSelectPlace(place.id)}
              >
                <span className="map-dom-pin-label">{place.name}</span>
                <span className="map-dom-pin-dot" />
              </button>
            )
          })}
        </div>
      </div>
      <p className="pointer-events-none absolute left-3 top-3 z-30 rounded-full bg-[color:var(--color-peat)]/88 px-3 py-1 text-[11px] tracking-wide text-[color:var(--color-cream)]">
        Tap a pin · OpenStreetMap
      </p>
    </div>
  )
}

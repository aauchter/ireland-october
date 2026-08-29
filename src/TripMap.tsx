import { GeoJSONSource, LngLatBounds, Map as MapLibreMap, NavigationControl } from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  placeTone,
  places,
  type GalwayTransport,
  type SaturdayPath,
} from './data'
import { PIN_COPY } from './mapPins'

const CARTO_STYLE = {
  version: 8 as const,
  name: 'CARTO Voyager',
  sources: {
    carto: {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: 'carto-voyager', type: 'raster' as const, source: 'carto' }],
}

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

function pinBounds(transport: GalwayTransport) {
  const pts = mapPlaces(transport)
  const lngs = pts.map((p) => p.lng)
  const lats = pts.map((p) => p.lat)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const padLng = Math.max((maxLng - minLng) * 0.18, 0.45)
  const padLat = Math.max((maxLat - minLat) * 0.2, 0.22)
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

function fitPadding(width: number) {
  const x = Math.max(72, Math.min(110, Math.round(width * 0.2)))
  return { top: 56, bottom: 64, left: x, right: x }
}

function fitPins(target: MapLibreMap, transport: GalwayTransport) {
  const bounds = new LngLatBounds()
  mapPlaces(transport).forEach((place) => bounds.extend([place.lng, place.lat]))
  if (bounds.isEmpty()) return
  const width = target.getContainer().clientWidth || 390
  target.fitBounds(bounds, { padding: fitPadding(width), maxZoom: 7.2, duration: 0 })
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
    let fitted = false

    const ensureRoute = (target: MapLibreMap) => {
      if (!target.isStyleLoaded()) return
      if (!target.getSource('trip-route')) {
        target.addSource('trip-route', { type: 'geojson', data: routeGeoJSON(stateRef.current.transport) })
        target.addLayer({
          id: 'trip-route-glow',
          type: 'line',
          source: 'trip-route',
          paint: { 'line-color': '#c9a45a', 'line-width': 8, 'line-opacity': 0.45 },
        })
        target.addLayer({
          id: 'trip-route-line',
          type: 'line',
          source: 'trip-route',
          paint: { 'line-color': '#152018', 'line-width': 3.2, 'line-dasharray': [1.6, 1.1] },
        })
      }
      const route = target.getSource('trip-route') as GeoJSONSource | undefined
      route?.setData(routeGeoJSON(stateRef.current.transport))
    }

    try {
      map = new MapLibreMap({
        container,
        style: CARTO_STYLE,
        center: [-8.05, 53.15],
        zoom: 6.2,
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
        ensureRoute(map)
        if (!fitted && !stateRef.current.selectedPlaceId) {
          fitPins(map, stateRef.current.transport)
          fitted = true
        }
        setMapReady(true)
        setTick((n) => n + 1)
      } catch {
        setTick((n) => n + 1)
      }
    }

    map.on('load', onReady)
    map.on('style.load', onReady)
    map.on('move', () => setTick((n) => n + 1))

    const ro = new ResizeObserver(() => {
      if (!map) return
      map.resize()
      if (map.isStyleLoaded() && !stateRef.current.selectedPlaceId) {
        fitPins(map, stateRef.current.transport)
      }
      setTick((n) => n + 1)
    })
    ro.observe(container)

    const poll = window.setInterval(() => {
      if (map && map.isStyleLoaded()) {
        onReady()
        window.clearInterval(poll)
      }
    }, 300)

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
    if (selectedPlaceId) {
      const place = places.find((item) => item.id === selectedPlaceId)
      if (place) map.flyTo({ center: [place.lng, place.lat], zoom: 9, speed: 0.85 })
    } else {
      fitPins(map, transport)
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

  const line = route
    .map((coord) => {
      const point = project(coord[0], coord[1])
      return `${point.x},${point.y}`
    })
    .join(' ')

  void tick

  return (
    <div
      className="relative z-[3] isolate overflow-hidden rounded-[22px] border border-[#d9cbb0] bg-[#e8e4dc]"
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
            const side = PIN_COPY[place.id]?.side ?? place.labelSide ?? 'top'
            const label = PIN_COPY[place.id]?.label ?? place.mapLabel ?? place.name
            return (
              <button
                key={place.id}
                type="button"
                className={`map-dom-pin label-${side}${active ? ' is-active' : ''}${tone === 'dim' ? ' is-dim' : ''}`}
                data-place-id={place.id}
                aria-label={place.name}
                style={{ left: `${point.x}px`, top: `${point.y}px` }}
                onClick={() => onSelectPlace(place.id)}
              >
                <span className="map-dom-pin-label">{label}</span>
                <span className="map-dom-pin-dot" />
              </button>
            )
          })}
        </div>
      </div>
      <p className="pointer-events-none absolute left-3 top-3 z-30 rounded-full bg-[color:var(--color-peat)]/88 px-3 py-1 text-[11px] tracking-wide text-[color:var(--color-cream)]">
        Tap a pin · CARTO / OSM
      </p>
    </div>
  )
}

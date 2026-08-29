export type SaturdayPath = 'connemara' | 'south'
export type GalwayTransport = 'drive' | 'train'

export type Link = {
  label: string
  href: string
}

export type Place = {
  id: string
  name: string
  kind: string
  lng: number
  lat: number
  blurb: string
  hours?: string
  official: Link
  mapsQuery: string
  extraLinks?: Link[]
  dayId: string
  mapLabel?: string
  labelSide?: 'top' | 'bottom' | 'left' | 'right'
  photoId?: 'dublin' | 'galway' | 'clonmacnoise' | 'aughnanure' | 'kylemore' | 'dunguaire' | 'kilmacduagh' | 'athenry' | 'carton' | 'kilkenny'
  showWhen?: {
    transport?: GalwayTransport[]
    saturday?: SaturdayPath[]
  }
}

export type DayBlock = {
  sleep: string
  move: string
  eat?: string
  notes: string[]
  links: Link[]
  placeIds: string[]
}

export type Day = {
  id: string
  iso: string
  weekday: string
  dayNum: string
  month: string
  kicker: string
  title: string
  city: string
  always: Omit<DayBlock, 'move'> & { move?: string }
  byTransport?: Partial<Record<GalwayTransport, Partial<DayBlock>>>
  bySaturday?: Partial<Record<SaturdayPath, Partial<DayBlock>>>
}

export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export const LINKS = {
  irishRail: 'https://www.irishrail.ie',
  irishRailPlanner: 'https://www.irishrail.ie/en-ie/plan-your-journey',
  tfi: 'https://www.transportforireland.ie/',
  leap: 'https://www.leapcard.ie/',
  clonmacnoise: 'https://heritageireland.ie/places-to-visit/clonmacnoise-monastic-site/',
  athenry: 'https://heritageireland.ie/places-to-visit/athenry-castle/',
  aughnanure: 'https://heritageireland.ie/places-to-visit/aughnanure-castle/',
  kylemore: 'https://www.kylemoreabbey.com/',
  kilkennyCastle: 'https://www.kilkennycastle.ie/',
  carton: 'https://www.cartonhouse.com/',
  maynoothCastle: 'https://heritageireland.ie/places-to-visit/maynooth-castle/',
  dunguaire: 'https://www.dunguairecastle.com/',
  kilmacduagh: 'https://heritageireland.ie/unguided-sites/kilmacduagh-monastic-site/',
  marker: 'https://www.anantara.com/en/the-marker-dublin',
  dean: 'https://thedean.ie/dublin/',
  dubAirport: 'https://www.dublinairport.com/',
  sfo: 'https://www.flysfo.com/',
  aerLingus: 'https://www.aerlingus.com/',
  aa: 'https://www.aa.com/',
} as const

export const places: Place[] = [
  {
    id: 'dublin',
    name: 'Dublin',
    kind: 'City',
    lng: -6.2603,
    lat: 53.3498,
    mapLabel: 'Dublin',
    labelSide: 'bottom',
    blurb:
      'Landing, a quiet prep night, and the last drinking weekend. In the city we walk, use a Leap card, and take the DART — no rental car on Dublin days.',
    official: { label: 'Transport for Ireland', href: LINKS.tfi },
    mapsQuery: 'Dublin Ireland',
    photoId: 'dublin',
    extraLinks: [
      { label: 'Leap Card', href: LINKS.leap },
      { label: 'Irish Rail', href: LINKS.irishRail },
    ],
    dayId: 'oct-1',
  },
  {
    id: 'dub-airport',
    name: 'Dublin Airport',
    kind: 'Airport',
    lng: -6.2701,
    lat: 53.4264,
    mapLabel: 'DUB airport',
    labelSide: 'top',
    blurb:
      'Arrive Thursday 1 Oct at 11:45 local. Depart Monday 12 Oct at 12:50. Leave the hotel around 9–9:30am that morning.',
    official: { label: 'Dublin Airport', href: LINKS.dubAirport },
    mapsQuery: 'Dublin Airport DUB',
    photoId: 'dublin',
    extraLinks: [{ label: 'SFO', href: LINKS.sfo }],
    dayId: 'oct-12',
  },
  {
    id: 'galway',
    name: 'Galway',
    kind: 'City',
    lng: -9.0568,
    lat: 53.2707,
    mapLabel: 'Galway',
    labelSide: 'left',
    blurb:
      'Friday and Saturday nights at a friends’ house in downtown Galway. Ask them about parking if we bring a car. One countryside day on Saturday — pick a single loop, not both coasts.',
    official: { label: 'Irish Rail · Galway Ceannt', href: LINKS.irishRailPlanner },
    mapsQuery: 'Galway city centre Ireland',
    photoId: 'galway',
    dayId: 'oct-2',
  },
  {
    id: 'clonmacnoise',
    name: 'Clonmacnoise',
    kind: 'Monastery',
    lng: -7.9861,
    lat: 53.3267,
    mapLabel: 'Clonmacnoise',
    labelSide: 'top',
    blurb:
      'Early Christian monastery on the Shannon, south of Athlone off the M6. The one outbound stop if we drive Friday. About 1–1.5 hours on site. Skip Athlone Castle unless we want lunch.',
    hours: 'Typically 10:00–18:00 in October — check hours.',
    official: { label: 'Heritage Ireland · Clonmacnoise', href: LINKS.clonmacnoise },
    mapsQuery: 'Clonmacnoise Monastic Site',
    photoId: 'clonmacnoise',
    extraLinks: [{ label: 'OPW Heritage Ireland', href: 'https://heritageireland.ie/' }],
    dayId: 'oct-2',
    showWhen: { transport: ['drive'] },
  },
  {
    id: 'aughnanure',
    name: 'Aughnanure Castle',
    kind: 'Tower house',
    lng: -9.2008,
    lat: 53.4186,
    mapLabel: 'Aughnanure',
    labelSide: 'left',
    blurb:
      'O’Flaherty tower house, about 25 minutes from Galway. First stop on the Connemara Saturday — mountains and a real castle, then on to Kylemore.',
    hours: 'OPW site — check hours before we go.',
    official: { label: 'Heritage Ireland · Aughnanure', href: LINKS.aughnanure },
    mapsQuery: 'Aughnanure Castle Oughterard',
    photoId: 'aughnanure',
    dayId: 'oct-3',
    showWhen: { saturday: ['connemara'] },
  },
  {
    id: 'kylemore',
    name: 'Kylemore Abbey',
    kind: 'Abbey',
    lng: -9.8894,
    lat: 53.5617,
    mapLabel: 'Kylemore',
    labelSide: 'top',
    blurb:
      'Victorian abbey and gardens in the Connemara mountains. Full-day pairing with Aughnanure. Do not bolt the Cliffs of Moher onto this loop.',
    hours: 'Seasonal — check hours on the official site.',
    official: { label: 'Kylemore Abbey', href: LINKS.kylemore },
    mapsQuery: 'Kylemore Abbey Connemara',
    photoId: 'kylemore',
    dayId: 'oct-3',
    showWhen: { saturday: ['connemara'] },
  },
  {
    id: 'dunguaire',
    name: 'Dunguaire Castle',
    kind: 'Castle',
    lng: -8.9306,
    lat: 53.1422,
    mapLabel: 'Dunguaire',
    labelSide: 'left',
    blurb:
      'Sixteenth-century tower house at Kinvara, about 25 minutes from Galway. South Saturday stop, same direction as the Burren. Interior has been closed to visitors — still worth seeing from outside; check the official site.',
    hours: 'Currently closed to the public — check before we go.',
    official: { label: 'Dunguaire Castle', href: LINKS.dunguaire },
    mapsQuery: 'Dunguaire Castle Kinvara',
    photoId: 'dunguaire',
    dayId: 'oct-3',
    showWhen: { saturday: ['south'] },
  },
  {
    id: 'kilmacduagh',
    name: 'Kilmacduagh',
    kind: 'Monastic ruins',
    lng: -8.8875,
    lat: 53.0494,
    mapLabel: 'Kilmacduagh',
    labelSide: 'bottom',
    blurb:
      'Monastic ruins near Gort with a famously leaning round tower. Unguided OPW site, daylight hours. Pair with Dunguaire on the south loop — not with Connemara.',
    hours: 'Unguided site; daylight hours. Check conditions.',
    official: { label: 'Heritage Ireland · Kilmacduagh', href: LINKS.kilmacduagh },
    mapsQuery: 'Kilmacduagh monastic site Gort',
    photoId: 'kilmacduagh',
    dayId: 'oct-3',
    showWhen: { saturday: ['south'] },
  },
  {
    id: 'athenry',
    name: 'Athenry Castle',
    kind: 'Castle',
    lng: -8.7447,
    lat: 53.3006,
    mapLabel: 'Athenry',
    labelSide: 'right',
    blurb:
      'Thirteenth-century castle with town walls and a priory. About 20 minutes east of Galway on the M6. The Sunday drive stop if we have the car (~45 min on site), then straight to Dublin. If we took the train, Athenry is a short local hop from Galway instead.',
    hours: 'OPW — check hours.',
    official: { label: 'Heritage Ireland · Athenry Castle', href: LINKS.athenry },
    mapsQuery: 'Athenry Castle County Galway',
    photoId: 'athenry',
    dayId: 'oct-4',
  },
  {
    id: 'carton',
    name: 'Carton House',
    kind: 'Hotel · summit',
    lng: -6.5615,
    lat: 53.3785,
    mapLabel: 'Carton',
    labelSide: 'bottom',
    blurb:
      'Carton Demesne, Maynooth, Co. Kildare, W23 TD98. Work summit Monday–Wednesday. Check-in Monday 5 Oct at 3:00pm. Optional breakfast Thursday 8 Oct, 8–10am, then we leave. Partner likely in a second room those nights.',
    official: { label: 'Carton House', href: LINKS.carton },
    mapsQuery: 'Carton House Maynooth W23 TD98',
    photoId: 'carton',
    extraLinks: [
      { label: 'Fairmont listing', href: 'https://www.fairmont.com/en/hotels/county-kildare/carton-house.html' },
    ],
    dayId: 'oct-5',
  },
  {
    id: 'maynooth-castle',
    name: 'Maynooth Castle',
    kind: 'Castle',
    lng: -6.5944,
    lat: 53.3809,
    mapLabel: 'Maynooth',
    labelSide: 'top',
    blurb:
      'Next door to Carton House if there is a gap during the summit. Norman keep of the FitzGeralds. OPW; the published 2026 season is 23 April–23 September — likely closed in October. Check hours.',
    hours: 'Seasonal OPW site; 2026 listing ends 23 September. Check hours.',
    official: { label: 'Heritage Ireland · Maynooth Castle', href: LINKS.maynoothCastle },
    mapsQuery: 'Maynooth Castle Co Kildare',
    photoId: 'carton',
    dayId: 'oct-6',
  },
  {
    id: 'kilkenny',
    name: 'Kilkenny',
    kind: 'City',
    lng: -7.2522,
    lat: 52.6541,
    mapLabel: 'Kilkenny',
    labelSide: 'bottom',
    blurb:
      'Thursday one-nighter. Sleep in town by the castle, not out on the ring road. Castle in the afternoon or evening; then Friday train back to Heuston.',
    official: { label: 'Kilkenny Castle', href: LINKS.kilkennyCastle },
    mapsQuery: 'Kilkenny Castle Ireland',
    photoId: 'kilkenny',
    extraLinks: [{ label: 'Irish Rail · MacDonagh', href: LINKS.irishRailPlanner }],
    dayId: 'oct-8',
  },
]

export const days: Day[] = [
  {
    id: 'sep-30',
    iso: '2026-09-30',
    weekday: 'Wed',
    dayNum: '30',
    month: 'Sep',
    kicker: 'Airborne',
    title: 'Leave San Francisco',
    city: 'SFO → DUB',
    always: {
      sleep: 'Overnight on the aircraft.',
      eat: 'Airport and onboard — nothing to plan.',
      notes: [
        'Aer Lingus / American codeshare AA 8324.',
        'SFO Wednesday 30 Sep, 5:40pm PT → Dublin Thursday 1 Oct, 11:45am local. About 10 hours.',
        'Ireland will be IST (UTC+1) in early October.',
      ],
      links: [
        { label: 'SFO', href: LINKS.sfo },
        { label: 'Dublin Airport', href: LINKS.dubAirport },
        { label: 'Aer Lingus', href: LINKS.aerLingus },
        { label: 'American Airlines', href: LINKS.aa },
      ],
      placeIds: ['dub-airport'],
    },
  },
  {
    id: 'oct-1',
    iso: '2026-10-01',
    weekday: 'Thu',
    dayNum: '1',
    month: 'Oct',
    kicker: 'Recover',
    title: 'Land, Dublin, early night',
    city: 'Dublin',
    always: {
      sleep: 'Dublin — a simple one-night hotel. Skip fancy card programs. Not a party night.',
      move: 'Land 11:45am. Airport to the city by taxi, Airlink, or bus. In town: walk, Leap card, DART. No rental car on Dublin city days.',
      eat: 'Whatever is nearby and easy. Early dinner, early sleep.',
      notes: [
        'The point of the day is to land and recover, not to see Dublin.',
        'If we want a car for Galway, pick it up Friday morning — not tonight.',
      ],
      links: [
        { label: 'Dublin Airport', href: LINKS.dubAirport },
        { label: 'Transport for Ireland', href: LINKS.tfi },
        { label: 'Leap Card', href: LINKS.leap },
        { label: 'Map · Dublin', href: mapsUrl('Dublin city centre Ireland') },
      ],
      placeIds: ['dublin', 'dub-airport'],
    },
  },
  {
    id: 'oct-2',
    iso: '2026-10-02',
    weekday: 'Fri',
    dayNum: '2',
    month: 'Oct',
    kicker: 'West',
    title: 'Dublin to Galway',
    city: 'Galway',
    always: {
      sleep: 'Friends’ house in downtown Galway (no hotel). Ask about parking if we have a car.',
      eat: 'Galway is easy — we can decide with our hosts.',
      notes: [],
      links: [],
      placeIds: ['galway'],
    },
    byTransport: {
      drive: {
        move: 'Rent a car Friday morning in Dublin. Motorway M6 west. One stop only: Clonmacnoise (south of Athlone, off the M6). About 1–1.5 hours on site, then on to Galway. Drop the car Sunday back in Dublin. Skip Athlone Castle unless we want lunch. Do not add Birr or Portumna.',
        notes: [
          'Ask our friends about parking at the house.',
          'Clonmacnoise is OPW; typically 10:00–18:00 in October — check hours.',
        ],
        links: [
          { label: 'Clonmacnoise (OPW)', href: LINKS.clonmacnoise },
          { label: 'Map · Clonmacnoise', href: mapsUrl('Clonmacnoise Monastic Site') },
          { label: 'Map · Galway', href: mapsUrl('Galway city centre Ireland') },
        ],
        placeIds: ['galway', 'clonmacnoise'],
      },
      train: {
        move: 'No car. Heuston → Galway Ceannt, about 2h 20–2h 45. We skip the ruin stops on the way. Book on irishrail.ie the week before.',
        notes: [
          'Athenry is a short local train from Galway if we still want a castle without driving.',
          'Connemara tomorrow becomes a coach tour rather than a self-drive.',
        ],
        links: [
          { label: 'Irish Rail journey planner', href: LINKS.irishRailPlanner },
          { label: 'Irish Rail', href: LINKS.irishRail },
          { label: 'Map · Galway Ceannt', href: mapsUrl('Galway Ceannt Station') },
        ],
        placeIds: ['galway'],
      },
    },
  },
  {
    id: 'oct-3',
    iso: '2026-10-03',
    weekday: 'Sat',
    dayNum: '3',
    month: 'Oct',
    kicker: 'Countryside',
    title: 'One loop from Galway',
    city: 'Galway',
    always: {
      sleep: 'Second night at the friends’ house in downtown Galway.',
      eat: 'Pack a simple lunch or stop in a town on the loop. Nothing booked.',
      notes: [
        'Pick one loop, not both coasts. The toggle at the top chooses Connemara or South.',
        'Do not bolt the Cliffs of Moher onto Connemara.',
      ],
      links: [],
      placeIds: ['galway'],
    },
    bySaturday: {
      connemara: {
        move: 'Connemara (recommended): mountains and a real castle. Aughnanure Castle (O’Flaherty tower house, ~25 min, OPW) then Kylemore Abbey. Full day.',
        notes: [
          'If we did not bring a car, this becomes a Connemara coach tour from Galway rather than a self-drive.',
        ],
        links: [
          { label: 'Aughnanure Castle (OPW)', href: LINKS.aughnanure },
          { label: 'Kylemore Abbey', href: LINKS.kylemore },
          { label: 'Map · Aughnanure', href: mapsUrl('Aughnanure Castle Oughterard') },
          { label: 'Map · Kylemore', href: mapsUrl('Kylemore Abbey Connemara') },
        ],
        placeIds: ['galway', 'aughnanure', 'kylemore'],
      },
      south: {
        move: 'South (ruins and the bay): Dunguaire Castle at Kinvara (~25 min) and Kilmacduagh monastic ruins near Gort (leaning round tower). Same direction as the Burren / Cliffs of Moher — this is that coast, not a second loop after Connemara.',
        notes: [
          'Dunguaire’s interior has been closed; still a landmark from outside. Check the official site.',
          'Kilmacduagh is an unguided OPW site — daylight, uneven ground.',
          'If we did not bring a car, this south loop is a taxi or local bus from Galway — not a second drive after Connemara.',
        ],
        links: [
          { label: 'Dunguaire Castle', href: LINKS.dunguaire },
          { label: 'Kilmacduagh (OPW)', href: LINKS.kilmacduagh },
          { label: 'Map · Dunguaire', href: mapsUrl('Dunguaire Castle Kinvara') },
          { label: 'Map · Kilmacduagh', href: mapsUrl('Kilmacduagh monastic site Gort') },
        ],
        placeIds: ['galway', 'dunguaire', 'kilmacduagh'],
      },
    },
  },
  {
    id: 'oct-4',
    iso: '2026-10-04',
    weekday: 'Sun',
    dayNum: '4',
    month: 'Oct',
    kicker: 'East again',
    title: 'Back to Dublin, quiet night',
    city: 'Dublin',
    always: {
      sleep: 'Dublin again — another simple one-night hotel. Quiet prep night. Carton House check-in is 3pm Monday.',
      eat: 'Keep it light. Early night before the summit.',
      notes: ['Do not redo Clonmacnoise on the way home.'],
      links: [
        { label: 'Transport for Ireland', href: LINKS.tfi },
        { label: 'Map · Dublin', href: mapsUrl('Dublin city centre Ireland') },
      ],
      placeIds: ['dublin'],
    },
    byTransport: {
      drive: {
        move: 'Drive: Athenry Castle (~20 min east of Galway, on the M6, 13th-century, town walls and priory, ~45 min) then straight to Dublin. Drop the car in Dublin. No rental car once we are in the city.',
        links: [
          { label: 'Athenry Castle (OPW)', href: LINKS.athenry },
          { label: 'Map · Athenry Castle', href: mapsUrl('Athenry Castle County Galway') },
          { label: 'Irish Rail', href: LINKS.irishRail },
        ],
        placeIds: ['dublin', 'athenry'],
      },
      train: {
        move: 'Train Galway Ceannt → Heuston, about 2h 20–2h 45. We skip the on-the-way ruin stops. Optional: a short local train to Athenry before the Dublin service, if we still want that castle. Then walk / Leap / taxi in Dublin.',
        links: [
          { label: 'Irish Rail journey planner', href: LINKS.irishRailPlanner },
          { label: 'Athenry Castle (optional)', href: LINKS.athenry },
        ],
        placeIds: ['dublin', 'athenry'],
      },
    },
  },
  {
    id: 'oct-5',
    iso: '2026-10-05',
    weekday: 'Mon',
    dayNum: '5',
    month: 'Oct',
    kicker: 'Summit',
    title: 'Carton House check-in',
    city: 'Maynooth',
    always: {
      sleep: 'Carton House, Carton Demesne, Maynooth, Co. Kildare, W23 TD98. Work summit. Partner likely in a second room (Fairmont / Amex Fine Hotels if that room is booked through Amex Travel).',
      move: 'Check-in 3:00pm. Getting there from Dublin: taxi, or train toward Maynooth and a short hop to the demesne. No rental car needed.',
      eat: 'Monday evening there is a group dinner in Dublin — so one of us is in the city that night, then back to the hotel.',
      notes: [
        'Work stays light on this page: a summit at Carton House, not a published agenda.',
        'Maynooth Castle is next door if there is a gap — check hours; OPW season often ends in September.',
      ],
      links: [
        { label: 'Carton House', href: LINKS.carton },
        { label: 'Map · Carton House', href: mapsUrl('Carton House Maynooth W23 TD98') },
        { label: 'Maynooth Castle (OPW)', href: LINKS.maynoothCastle },
        { label: 'Irish Rail', href: LINKS.irishRail },
      ],
      placeIds: ['carton', 'maynooth-castle'],
    },
  },
  {
    id: 'oct-6',
    iso: '2026-10-06',
    weekday: 'Tue',
    dayNum: '6',
    month: 'Oct',
    kicker: 'Summit',
    title: 'Carton House, full day',
    city: 'Maynooth',
    always: {
      sleep: 'Second night at Carton House. Partner in the second room.',
      move: 'On the demesne. Maynooth village and Maynooth Castle are next door if there is a gap.',
      notes: [
        'No full agenda here. If the day opens up, the castle is the walkable extra — and it may already be closed for the season.',
      ],
      links: [
        { label: 'Carton House', href: LINKS.carton },
        { label: 'Maynooth Castle (OPW)', href: LINKS.maynoothCastle },
        { label: 'Map · Maynooth Castle', href: mapsUrl('Maynooth Castle Co Kildare') },
      ],
      placeIds: ['carton', 'maynooth-castle'],
    },
  },
  {
    id: 'oct-7',
    iso: '2026-10-07',
    weekday: 'Wed',
    dayNum: '7',
    month: 'Oct',
    kicker: 'Summit',
    title: 'Work session, last Carton night',
    city: 'Maynooth',
    always: {
      sleep: 'Third night at Carton House. Optional breakfast Thursday 8–10am, then we leave.',
      move: 'Wednesday morning is a work session. Stay on the demesne unless the day ends early.',
      notes: ['Tomorrow is the Kilkenny one-nighter — no car. Book the Waterford-line train the week before.'],
      links: [
        { label: 'Carton House', href: LINKS.carton },
        { label: 'Irish Rail journey planner', href: LINKS.irishRailPlanner },
        { label: 'Map · Carton House', href: mapsUrl('Carton House Maynooth W23 TD98') },
      ],
      placeIds: ['carton'],
    },
  },
  {
    id: 'oct-8',
    iso: '2026-10-08',
    weekday: 'Thu',
    dayNum: '8',
    month: 'Oct',
    kicker: 'Castle town',
    title: 'Kilkenny one-nighter',
    city: 'Kilkenny',
    always: {
      sleep: 'Kilkenny, in town by the castle — not the ring road. Walkable. Recommendation only; nothing booked.',
      move: 'No car. Do not take the Maynooth commuter to Connolly (you would still have to cross Dublin to Heuston; Irish Rail wants ~1 hour for that transfer). Best: hotel taxi to Kildare station (~30–40 min south). Waterford-line trains stop at Kildare and take ~1 hour to Kilkenny MacDonagh. Fallback: taxi to Dublin Heuston (~30 min) then train ~1.5 hours to Kilkenny. Whole-way taxi ~1.5–2 hours only if trains do not work. Book on irishrail.ie the week before.',
      eat: 'In town, near the castle. We can choose on the day.',
      notes: [
        'Optional Carton House breakfast 8–10am, then leave.',
        'Kilkenny Castle in the afternoon or evening. Check hours.',
      ],
      links: [
        { label: 'Irish Rail journey planner', href: LINKS.irishRailPlanner },
        { label: 'Kilkenny Castle', href: LINKS.kilkennyCastle },
        { label: 'Map · Kildare station', href: mapsUrl('Kildare railway station Ireland') },
        { label: 'Map · Kilkenny Castle', href: mapsUrl('Kilkenny Castle Ireland') },
      ],
      placeIds: ['kilkenny'],
    },
  },
  {
    id: 'oct-9',
    iso: '2026-10-09',
    weekday: 'Fri',
    dayNum: '9',
    month: 'Oct',
    kicker: 'Nightlife',
    title: 'Kilkenny to Dublin',
    city: 'Dublin',
    always: {
      sleep: 'Dublin for the drinking weekend. Two hotel ideas, neither booked: Anantara The Marker (docklands, Amex FHR — the credit hotel) or The Dean Dublin if we want to be in the pubs.',
      move: 'Kilkenny MacDonagh → Heuston, then taxi to the Dublin hotel. No rental car.',
      eat: 'Start of the nightlife weekend. Nothing named; we will walk into it.',
      notes: [
        'We only have three Dublin weekend nights (Fri, Sat, Sun) — mention Marker as the credit hotel, not a 4th-night lock.',
        'Chase Edit / extra hotel credit only if the card is Sapphire Reserve, not Preferred.',
      ],
      links: [
        { label: 'Irish Rail journey planner', href: LINKS.irishRailPlanner },
        { label: 'Anantara The Marker Dublin', href: LINKS.marker },
        { label: 'The Dean Dublin', href: LINKS.dean },
        { label: 'Map · The Marker', href: mapsUrl('Anantara The Marker Dublin Grand Canal Square') },
        { label: 'Map · The Dean', href: mapsUrl('The Dean Dublin 33 Harcourt Street') },
      ],
      placeIds: ['dublin', 'kilkenny'],
    },
  },
  {
    id: 'oct-10',
    iso: '2026-10-10',
    weekday: 'Sat',
    dayNum: '10',
    month: 'Oct',
    kicker: 'Nightlife',
    title: 'Dublin, drinking weekend',
    city: 'Dublin',
    always: {
      sleep: 'Same Dublin hotel as Friday night. Marker vs The Dean — still a recommendation, not a booking.',
      move: 'Walk, Leap card, DART. Stay in the city.',
      eat: 'Pubs and whatever we find. No restaurant list on this page.',
      notes: ['This is the loose middle of the weekend. No itinerary beyond being in Dublin together.'],
      links: [
        { label: 'Transport for Ireland', href: LINKS.tfi },
        { label: 'Leap Card', href: LINKS.leap },
        { label: 'Anantara The Marker Dublin', href: LINKS.marker },
        { label: 'The Dean Dublin', href: LINKS.dean },
      ],
      placeIds: ['dublin'],
    },
  },
  {
    id: 'oct-11',
    iso: '2026-10-11',
    weekday: 'Sun',
    dayNum: '11',
    month: 'Oct',
    kicker: 'Nightlife',
    title: 'Last Dublin night',
    city: 'Dublin',
    always: {
      sleep: 'Third and last Dublin weekend night. Flight is tomorrow at 12:50pm — leave the hotel around 9–9:30am.',
      move: 'City day. No car. Keep bags simple for a morning airport run.',
      eat: 'A proper dinner if last night was late; otherwise a walk and a pint.',
      notes: ['Pack tonight. Morning of the 12th is for the airport, not for one more neighbourhood.'],
      links: [
        { label: 'Dublin Airport', href: LINKS.dubAirport },
        { label: 'Anantara The Marker Dublin', href: LINKS.marker },
        { label: 'The Dean Dublin', href: LINKS.dean },
        { label: 'Map · Dublin Airport', href: mapsUrl('Dublin Airport DUB') },
      ],
      placeIds: ['dublin'],
    },
  },
  {
    id: 'oct-12',
    iso: '2026-10-12',
    weekday: 'Mon',
    dayNum: '12',
    month: 'Oct',
    kicker: 'Homebound',
    title: 'Dublin to San Francisco',
    city: 'DUB → SFO',
    always: {
      sleep: 'On the aircraft, then home.',
      move: 'Leave the hotel about 9–9:30am. AA 8325, Dublin 12:50pm local → SFO 3:50pm PT the same day. About 11 hours.',
      eat: 'Airport.',
      notes: ['Times only — no booking references on this page.', 'SFO is still Sunday afternoon Pacific time.'],
      links: [
        { label: 'Dublin Airport', href: LINKS.dubAirport },
        { label: 'SFO', href: LINKS.sfo },
        { label: 'American Airlines', href: LINKS.aa },
        { label: 'Aer Lingus', href: LINKS.aerLingus },
        { label: 'Map · Dublin Airport', href: mapsUrl('Dublin Airport DUB') },
      ],
      placeIds: ['dub-airport'],
    },
  },
]

export const routeStops = [
  { id: 'dublin-1', label: 'Dublin', dayId: 'oct-1' },
  { id: 'galway', label: 'Galway', dayId: 'oct-2' },
  { id: 'dublin-2', label: 'Dublin', dayId: 'oct-4' },
  { id: 'maynooth', label: 'Maynooth', dayId: 'oct-5' },
  { id: 'kilkenny', label: 'Kilkenny', dayId: 'oct-8' },
  { id: 'dublin-3', label: 'Dublin', dayId: 'oct-9' },
  { id: 'airport', label: 'Airport', dayId: 'oct-12' },
] as const

export function placeTone(
  place: Place,
  transport: GalwayTransport,
  saturday: SaturdayPath,
): 'full' | 'dim' | 'hidden' {
  if (place.showWhen?.transport && !place.showWhen.transport.includes(transport)) {
    return 'hidden'
  }
  if (place.showWhen?.saturday && !place.showWhen.saturday.includes(saturday)) {
    return 'dim'
  }
  return 'full'
}

export function isPlaceVisible(
  place: Place,
  transport: GalwayTransport,
  saturday: SaturdayPath,
) {
  return placeTone(place, transport, saturday) !== 'hidden'
}

export function resolveDay(
  day: Day,
  transport: GalwayTransport,
  saturday: SaturdayPath,
): DayBlock & { title: string; kicker: string; city: string; id: string } {
  const t = day.byTransport?.[transport] ?? {}
  const s = day.id === 'oct-3' ? (day.bySaturday?.[saturday] ?? {}) : {}
  const sleep = s.sleep ?? t.sleep ?? day.always.sleep
  const move = s.move ?? t.move ?? day.always.move ?? ''
  const eat = s.eat ?? t.eat ?? day.always.eat
  const notes = [...(day.always.notes ?? []), ...(t.notes ?? []), ...(s.notes ?? [])]
  const links = [...(s.links ?? t.links ?? day.always.links)]
  const placeIds = s.placeIds ?? t.placeIds ?? day.always.placeIds
  return {
    id: day.id,
    title: day.title,
    kicker: day.kicker,
    city: day.city,
    sleep,
    move,
    eat,
    notes,
    links,
    placeIds,
  }
}

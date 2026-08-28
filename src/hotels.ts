import { mapsUrl } from './data'
import type { PhotoId } from './photos'

export type HotelStay = {
  id: string
  nights: string
  dates: string
  checkin: string
  checkout: string
  city: string
  why: string
  friendsHouse?: boolean
  picks: HotelPick[]
}

export type HotelPick = {
  id: string
  name: string
  role: 'pick' | 'alt'
  note: string
  walk: string
  official: { label: string; href: string }
  bookDirect?: { label: string; href: string }
  booking: string
  mapsQuery: string
  photoId?: PhotoId
  amexFhr?: boolean
}

function bookingSearch(ss: string, checkin: string, checkout: string) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(ss)}&checkin=${checkin}&checkout=${checkout}`
}

function bookingHotel(slug: string, checkin: string, checkout: string) {
  return `https://www.booking.com/hotel/ie/${slug}.html?checkin=${checkin}&checkout=${checkout}`
}

export const RATE_CHECKED = '28 Aug 2026'

export const hotelStays: HotelStay[] = [
  {
    id: 'oct-1-dublin',
    nights: 'Thu 1 Oct · 1 night',
    dates: '1–2 Oct 2026',
    checkin: '2026-10-01',
    checkout: '2026-10-02',
    city: 'Dublin · near Heuston',
    why: 'Land, recover, early night. Friday we leave for Galway from Heuston if we take the train — sleep on that side of the river.',
    picks: [
      {
        id: 'ashling',
        name: 'Ashling Hotel Dublin',
        role: 'pick',
        note: 'Across the road from Heuston. Simple, walkable to the Galway train. Not a nightlife hotel.',
        walk: 'About 3 minutes to Heuston Station.',
        official: { label: 'Ashling Hotel', href: 'https://www.ashlinghotel.ie/' },
        booking: bookingHotel('ashling', '2026-10-01', '2026-10-02'),
        mapsQuery: 'Ashling Hotel Dublin Heuston',
        photoId: 'ashling',
      },
      {
        id: 'maldron',
        name: 'Maldron Hotel Dublin Smithfield',
        role: 'alt',
        note: 'Smithfield Square, a short walk east of Heuston. Another straightforward city night.',
        walk: 'About 10–12 minutes to Heuston on foot.',
        official: { label: 'Maldron Smithfield', href: 'https://www.maldronhotelsmithfield.com/' },
        booking: bookingSearch('Maldron Hotel Dublin Smithfield', '2026-10-01', '2026-10-02'),
        mapsQuery: 'Maldron Hotel Dublin Smithfield',
        photoId: 'maldron',
      },
    ],
  },
  {
    id: 'oct-2-galway',
    nights: 'Fri 2 – Sat 3 Oct · 2 nights',
    dates: '2–4 Oct 2026',
    checkin: '2026-10-02',
    checkout: '2026-10-04',
    city: 'Galway',
    why: 'Friends’ house in downtown Galway. No hotel those nights. Ask them about parking if we bring a car.',
    friendsHouse: true,
    picks: [],
  },
  {
    id: 'oct-4-dublin',
    nights: 'Sun 4 Oct · 1 night',
    dates: '4–5 Oct 2026',
    checkin: '2026-10-04',
    checkout: '2026-10-05',
    city: 'Dublin · quiet, south city',
    why: 'Quiet prep night. Carton House check-in is 3pm Monday. A south-city or Ballsbridge hotel is an easy ~25-minute taxi to Maynooth. Skip Temple Bar.',
    picks: [
      {
        id: 'clayton',
        name: 'Clayton Hotel Burlington Road',
        role: 'pick',
        note: 'Dublin 4, south of the canal. Four-star conference hotel, not the party streets.',
        walk: 'About 25 minutes by taxi to Carton House on Monday.',
        official: { label: 'Clayton Burlington Road', href: 'https://www.claytonhotels.com/burlington-road/' },
        booking: bookingSearch('Clayton Hotel Burlington Road Dublin', '2026-10-04', '2026-10-05'),
        mapsQuery: 'Clayton Hotel Burlington Road Dublin',
        photoId: 'clayton',
      },
    ],
  },
  {
    id: 'oct-5-carton',
    nights: 'Mon 5 – Wed 7 Oct · 3 nights',
    dates: '5–8 Oct 2026',
    checkin: '2026-10-05',
    checkout: '2026-10-08',
    city: 'Carton House, Maynooth',
    why: 'Work summit. Check-in Monday 3:00pm. Optional breakfast Thursday 8–10am, then we leave for Kilkenny. Work may already cover his room; this card is for her room and the property itself.',
    picks: [
      {
        id: 'carton',
        name: 'Carton House',
        role: 'pick',
        note: 'Carton Demesne, Maynooth, Co. Kildare, W23 TD98. Partner likely in a second room. Fairmont / Amex Fine Hotels if that room goes through Amex Travel.',
        walk: 'On the demesne. Maynooth village is next door.',
        official: { label: 'Carton House', href: 'https://www.cartonhouse.com/' },
        bookDirect: {
          label: 'Fairmont listing',
          href: 'https://www.fairmont.com/en/hotels/county-kildare/carton-house.html',
        },
        booking: bookingHotel('carton-house', '2026-10-05', '2026-10-08'),
        mapsQuery: 'Carton House Maynooth W23 TD98',
        photoId: 'carton',
        amexFhr: true,
      },
    ],
  },
  {
    id: 'oct-8-kilkenny',
    nights: 'Thu 8 Oct · 1 night',
    dates: '8–9 Oct 2026',
    checkin: '2026-10-08',
    checkout: '2026-10-09',
    city: 'Kilkenny · by the castle',
    why: 'One-nighter in town. Sleep walkable to the castle, not out on the ring road.',
    picks: [
      {
        id: 'pembroke',
        name: 'Pembroke Kilkenny',
        role: 'pick',
        note: 'Patrick Street, in the centre. The usual recommendation for a castle-town night.',
        walk: 'About 8–10 minutes to Kilkenny Castle.',
        official: { label: 'Pembroke Kilkenny', href: 'https://www.pembrokekilkenny.com/' },
        booking: bookingSearch('Pembroke Kilkenny', '2026-10-08', '2026-10-09'),
        mapsQuery: 'Pembroke Hotel Kilkenny Patrick Street',
        photoId: 'kilkenny',
      },
      {
        id: 'rivercourt',
        name: 'River Court Hotel',
        role: 'alt',
        note: 'On the Nore beside the castle. Often a bit simpler than Pembroke; still walkable.',
        walk: 'A few minutes to Kilkenny Castle along the river.',
        official: { label: 'River Court Hotel', href: 'https://www.rivercourthotel.com/' },
        booking: bookingSearch('River Court Hotel Kilkenny', '2026-10-08', '2026-10-09'),
        mapsQuery: 'River Court Hotel Kilkenny',
        photoId: 'rivercourt',
      },
    ],
  },
  {
    id: 'oct-9-dublin',
    nights: 'Fri 9 – Sun 11 Oct · 3 nights',
    dates: '9–12 Oct 2026',
    checkin: '2026-10-09',
    checkout: '2026-10-12',
    city: 'Dublin · weekend, then the airport',
    why: 'Three Dublin nights only. Flight Monday 12 Oct at 12:50 — leave the hotel around 9–9:30am. Nothing booked.',
    picks: [
      {
        id: 'dean',
        name: 'The Dean Dublin',
        role: 'pick',
        note: 'Harcourt Street / Camden side. Better if we want to walk into the pubs.',
        walk: 'Nightlife streets on the doorstep. Taxi to Dublin Airport about 30–40 minutes in the morning.',
        official: { label: 'The Dean Dublin', href: 'https://thedean.ie/dublin/' },
        bookDirect: { label: 'Book direct', href: 'https://thedean.ie/book-direct/' },
        booking: bookingHotel('the-dean-dublin', '2026-10-09', '2026-10-12'),
        mapsQuery: 'The Dean Dublin 33 Harcourt Street',
        photoId: 'dean',
      },
      {
        id: 'marker',
        name: 'Anantara The Marker Dublin',
        role: 'alt',
        note: 'Grand Canal Dock. Calmer than Harcourt. The credit / Amex FHR hotel if we book through Amex Travel — not a fourth-night lock.',
        walk: 'Docklands. Taxi to Dublin Airport about 25–35 minutes.',
        official: { label: 'Anantara The Marker', href: 'https://www.anantara.com/en/the-marker-dublin' },
        booking: bookingHotel('the-marker', '2026-10-09', '2026-10-12'),
        mapsQuery: 'Anantara The Marker Dublin Grand Canal Square',
        photoId: 'marker',
        amexFhr: true,
      },
      {
        id: 'intercon',
        name: 'InterContinental Dublin',
        role: 'alt',
        note: 'Ballsbridge, IHG. Quieter south city if the weekend does not need to be in the pubs.',
        walk: 'Ballsbridge. Taxi to Dublin Airport about 30–40 minutes.',
        official: {
          label: 'InterContinental Dublin',
          href: 'https://www.ihg.com/intercontinental/hotels/gb/en/dublin/dblha/hoteldetail',
        },
        booking: bookingSearch('InterContinental Dublin Ballsbridge', '2026-10-09', '2026-10-12'),
        mapsQuery: 'InterContinental Dublin Ballsbridge',
        photoId: 'dublin',
      },
    ],
  },
]

export function stayMaps(query: string) {
  return mapsUrl(query)
}

# ChargeGo – EV & CNG Station Finder and Slot Booking System

> **S.Y. B.Tech Computer Engineering & Environmental Studies Project**  
> An engineering platform providing predictive station discovery, real-time connector power & pressure diagnostics, and concurrency-safe time slot reservations for electric vehicles and CNG transit corridors.

---

## ⚡ Key Highlights & Architecture

1. **Station Proximity Engine (Haversine Formula)**:
   - Accurately computes great-circle geographic distance ($d = 2R \arcsin(\dots)$) between user coordinates and charging hubs in kilometers.
   - Live location discovery with browser geolocation and fallback anchor coordinates (Pune–Mumbai clean mobility corridor).

2. **Interactive Leaflet & OpenStreetMap**:
   - Custom SVG map markers for EV charging hubs (Emerald ⚡), CNG cascade dispensers (Sky ⛽), and Hybrid multi-fuel hubs.
   - Interactive popups with distance, live bay availability, verified pricing, and external turn-by-turn navigation links.

3. **Concurrency-Safe Slot Booking Engine**:
   - Atomic reservation verification prevents double-booking race conditions on the same bay and time window.
   - Generates unique reference credentials (e.g. `CG-2026-EV-8492`).
   - Produces a digital pass complete with vector QR codes, duration estimations, and printable ticket receipts.
   - Immediate capacity release upon user or administrative cancellation.

4. **Multi-Role Access Control (RBAC)**:
   - **Driver / User Mode (Rahul Patil)**: View verified hubs, reserve slots, manage garage vehicles, view upcoming/completed bookings, and track notifications.
   - **Fleet & Grid Administrator (Priya Sharma)**: Real-time analytics, 7-day slot trend chart, station CRUD (add, update, delete with protection against orphan bookings), and CSV data export.

5. **Environmental Sustainability Calculator**:
   - Interactive emissions calculator comparing lifecycle carbon intensity (Well-to-Wheel vs Tank-to-Wheel).
   - Shows kg of CO₂ avoided, equivalent mature trees planted, and estimated fuel cost savings.
   - Academic disclaimer detailing Central Electricity Authority grid emission benchmarks (~0.71 kg CO₂/kWh).

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Lucide Icons, Plus Jakarta Sans & Outfit typography.
- **Mapping**: Leaflet 1.9 + OpenStreetMap tiles.
- **State & Concurrency**: Client-side storage engine with atomic reservation validation and pre-seeded realistic mobility hubs.
- **Data Model**: Relational PostgreSQL 3NF schema design (`profiles`, `stations`, `station_services`, `bookings`, `station_operating_hours`, `favourites`, `notifications`, `admin_audit_logs`).

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

---

## 🧪 Acceptance Test Scenarios

1. **Browse Stations**: Navigate to **Explore Stations** to filter by EV, CNG, radius (5–50 km), and sort by distance or price.
2. **Interactive Map**: Toggle between **Split View**, **List View**, and **Full Map**. Click any station marker to inspect bay availability.
3. **Slot Booking**: Click **Book Slot** on any station, select an available date & time slot, and enter vehicle details. Confirm to receive your digital QR pass.
4. **Double-Booking Prevention**: Attempt to book the same bay and slot again; the engine marks it as reserved and prevents overlapping bookings.
5. **Cancellation & Bay Release**: From **My Bookings**, cancel a confirmed reservation. The slot is immediately restored and made available to other drivers.
6. **Admin Fleet Management**: Switch to Admin mode via the top-right profile switcher to inspect 7-day booking trends, add new stations, update bay prices, and download a CSV booking export.

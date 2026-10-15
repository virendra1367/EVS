/**
 * ChargeGo – EV & CNG Station Finder and Slot Booking Platform
 * Brand: ChargeGo
 * Tagline: Smarter Stops. Cleaner Journeys.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Station, Booking, UserProfile, InAppNotification, StationType } from './types';
import {
  getStations,
  getBookings,
  getCurrentUser,
  setCurrentUser,
  getFavourites,
  toggleFavourite,
  getNotifications,
  markNotificationsAsRead,
  DEMO_USER,
  DEMO_ADMIN,
} from './utils/storage';
import { DEFAULT_COORDINATES, Coordinates, reverseGeocodeDetailed } from './utils/geo';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HomeFeatured } from './components/HomeFeatured';
import { StationFinder } from './components/StationFinder';
import { StationDetailModal } from './components/StationDetailModal';
import { BookingModal } from './components/BookingModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [stations, setStations] = useState<Station[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUserState] = useState<UserProfile>(DEMO_USER);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [userCoords, setUserCoords] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [userAddress, setUserAddress] = useState<string>('Shivajinagar, Pune, Maharashtra');
  const [userCity, setUserCity] = useState<string>('Shivajinagar');
  const [userVillage, setUserVillage] = useState<string>('Shivajinagar');
  const [userDistrict, setUserDistrict] = useState<string>('Pune');
  const [userStateName, setUserStateName] = useState<string>('Maharashtra');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLiveGPS, setIsLiveGPS] = useState<boolean>(false);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<string>('Live');

  // Modals & Navigation state
  const [detailStation, setDetailStation] = useState<Station | null>(null);
  const [bookingStation, setBookingStation] = useState<Station | null>(null);
  const [bookingBayId, setBookingBayId] = useState<string | undefined>();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  // Search carryover state from Hero to Explore
  const [searchParams, setSearchParams] = useState<{
    query: string;
    type: 'ALL' | StationType;
    radiusKm: number;
  }>({
    query: '',
    type: 'ALL',
    radiusKm: 25,
  });

  // Reload data from local store
  const refreshData = useCallback(() => {
    const loadedStations = getStations();
    const loadedBookings = getBookings();
    const loadedUser = getCurrentUser();
    const loadedFavs = getFavourites();
    const loadedNotifs = getNotifications(loadedUser.id);

    setStations(loadedStations);
    setBookings(loadedBookings);
    setCurrentUserState(loadedUser);
    setFavourites(loadedFavs);
    setNotifications(loadedNotifs);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle browser geolocation & reverse geocode real origin village/address
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserCoords(coords);
        setIsLocating(false);
        setIsLiveGPS(true);
        setLastGpsUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        const details = await reverseGeocodeDetailed(coords.latitude, coords.longitude);
        setUserAddress(details.fullAddress);
        setUserCity(details.shortDisplayName);
        setUserVillage(details.villageOrLocality);
        setUserDistrict(details.townOrDistrict);
        setUserStateName(details.state);
      },
      async () => {
        // Fallback to default
        setUserCoords(DEFAULT_COORDINATES);
        setIsLocating(false);
        setIsLiveGPS(false);
        const details = await reverseGeocodeDetailed(DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude);
        setUserAddress(details.fullAddress);
        setUserCity(details.shortDisplayName);
        setUserVillage(details.villageOrLocality);
        setUserDistrict(details.townOrDistrict);
        setUserStateName(details.state);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Attempt initial GPS detection on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setUserCoords(coords);
          setIsLiveGPS(true);
          setLastGpsUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          const details = await reverseGeocodeDetailed(coords.latitude, coords.longitude);
          setUserAddress(details.fullAddress);
          setUserCity(details.shortDisplayName);
          setUserVillage(details.villageOrLocality);
          setUserDistrict(details.townOrDistrict);
          setUserStateName(details.state);
        },
        () => {
          // If permission denied or unavailable, stay with default village/town
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Toggle favourite
  const handleToggleFav = (stationId: string) => {
    const updated = toggleFavourite(stationId);
    setFavourites(updated);
  };

  // Switch demo roles
  const handleSwitchRole = (role: 'user' | 'admin') => {
    const targetUser = role === 'admin' ? DEMO_ADMIN : DEMO_USER;
    setCurrentUser(targetUser);
    setCurrentUserState(targetUser);
    setNotifications(getNotifications(targetUser.id));

    if (role === 'admin') {
      setCurrentTab('admin');
    } else if (currentTab === 'admin') {
      setCurrentTab('home');
    }
  };

  // Handle Hero search submit
  const handleHeroSearch = (filters: { query: string; type: 'ALL' | StationType; radiusKm: number }) => {
    setSearchParams(filters);
    setCurrentTab('explore');
  };

  // Trigger Booking Modal
  const handleOpenBooking = (station?: Station, preferredBayId?: string) => {
    if (station) {
      setBookingStation(station);
      setBookingBayId(preferredBayId);
    } else {
      setBookingStation(stations[0] || null);
      setBookingBayId(undefined);
    }
    setIsBookingModalOpen(true);
    if (detailStation) {
      setDetailStation(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Strict 3-Zone Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        notifications={notifications}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenBookingDirect={() => handleOpenBooking()}
        onMarkNotificationsRead={() => {
          markNotificationsAsRead(currentUser.id);
          setNotifications(getNotifications(currentUser.id));
        }}
        onSwitchRole={handleSwitchRole}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        userCoords={userCoords}
        userAddress={userAddress}
        userCity={userCity}
        userVillage={userVillage}
        userDistrict={userDistrict}
        userStateName={userStateName}
        isLocating={isLocating}
        isLiveGPS={isLiveGPS}
        lastGpsUpdate={lastGpsUpdate}
        onRequestLocation={handleRequestLocation}
      />

      {/* Main App Page Routing */}
      <main className="flex-1">
        {/* TAB: HOME */}
        {currentTab === 'home' && (
          <div>
            <HeroSection
              onSearch={handleHeroSearch}
              onExploreMap={() => setCurrentTab('explore')}
              onQuickBook={() => handleOpenBooking()}
              userCity={userVillage ? `${userVillage}, ${userDistrict}` : userCity}
              onRequestLocation={handleRequestLocation}
              isLocating={isLocating}
            />

            <HomeFeatured
              stations={stations}
              userCoords={userCoords}
              favourites={favourites}
              onToggleFavourite={handleToggleFav}
              onSelectStation={(s) => setDetailStation(s)}
              onBookStation={(s) => handleOpenBooking(s)}
              onExploreAll={() => setCurrentTab('explore')}
            />
          </div>
        )}

        {/* TAB: EXPLORE STATIONS */}
        {currentTab === 'explore' && (
          <StationFinder
            stations={stations}
            userCoords={userCoords}
            userAddress={userAddress}
            userVillage={userVillage}
            favourites={favourites}
            onToggleFavourite={handleToggleFav}
            onSelectStation={(s) => setDetailStation(s)}
            onBookStation={(s) => handleOpenBooking(s)}
            onRequestLocation={handleRequestLocation}
            isLocating={isLocating}
            initialQuery={searchParams.query}
            initialType={searchParams.type}
            initialRadius={searchParams.radiusKm}
          />
        )}

        {/* TAB: USER BOOKINGS & GARAGE */}
        {currentTab === 'bookings' && (
          <UserDashboard
            currentUser={currentUser}
            bookings={bookings}
            onRefreshBookings={refreshData}
            onBookStation={(s) => handleOpenBooking(s)}
            onUpdateVehicles={(vehicles) => {
              const updated = { ...currentUser, vehicles };
              setCurrentUser(updated);
              setCurrentUserState(updated);
            }}
          />
        )}

        {/* TAB: ADMIN CONSOLE (Protected) */}
        {currentTab === 'admin' && (
          <div>
            {currentUser.role === 'admin' ? (
              <AdminDashboard
                stations={stations}
                bookings={bookings}
                adminEmail={currentUser.email}
                onRefreshData={refreshData}
              />
            ) : (
              <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-lg">
                <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                  🔒
                </div>
                <h2 className="text-xl font-bold text-slate-900">Restricted Admin Access</h2>
                <p className="text-xs text-slate-500">
                  Only verified fleet administrators have access to station configuration and audit records.
                </p>
                <button
                  onClick={() => handleSwitchRole('admin')}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Log in as Admin (Priya Sharma)
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
      />

      {/* Station Detail Modal */}
      {detailStation && (
        <StationDetailModal
          station={detailStation}
          userCoords={userCoords}
          onClose={() => setDetailStation(null)}
          onBook={(s, preferredBayId) => handleOpenBooking(s, preferredBayId)}
        />
      )}

      {/* Concurrency-Safe Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          stations={stations}
          initialStation={bookingStation || undefined}
          initialBayId={bookingBayId}
          currentUser={currentUser}
          onClose={() => {
            setIsBookingModalOpen(false);
            setBookingStation(null);
            setBookingBayId(undefined);
          }}
          onBookingSuccess={() => {
            refreshData();
          }}
        />
      )}

      {/* Fast Demo Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={(user) => {
            setCurrentUser(user);
            setCurrentUserState(user);
            setNotifications(getNotifications(user.id));
            if (user.role === 'admin') {
              setCurrentTab('admin');
            }
          }}
        />
      )}

      {/* About VoltWay Modal */}
      {isAboutModalOpen && (
        <AboutModal
          onClose={() => setIsAboutModalOpen(false)}
          onExploreStations={() => {
            setIsAboutModalOpen(false);
            setCurrentTab('explore');
          }}
        />
      )}

      {/* Contact & Support Modal */}
      {isContactModalOpen && (
        <ContactModal onClose={() => setIsContactModalOpen(false)} />
      )}
    </div>
  );
}

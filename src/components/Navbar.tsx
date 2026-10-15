import React, { useState } from 'react';
import { UserProfile, InAppNotification } from '../types';
import { Coordinates } from '../utils/geo';
import {
  Bell,
  Menu,
  X,
  Shield,
  User,
  LogOut,
  Check,
  Sparkles,
  Phone,
  HelpCircle,
  MapPin,
  Navigation,
  RefreshCw,
  Copy,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  currentUser: UserProfile;
  notifications: InAppNotification[];
  onOpenAuth: () => void;
  onOpenBookingDirect: () => void;
  onMarkNotificationsRead: () => void;
  onSwitchRole: (role: 'user' | 'admin') => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  userCoords: Coordinates;
  userAddress: string;
  userCity: string;
  userVillage?: string;
  userDistrict?: string;
  userStateName?: string;
  isLocating: boolean;
  isLiveGPS: boolean;
  lastGpsUpdate: string;
  onRequestLocation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  currentUser,
  notifications,
  onOpenAuth,
  onOpenBookingDirect,
  onMarkNotificationsRead,
  onSwitchRole,
  onOpenAbout,
  onOpenContact,
  userCoords,
  userAddress,
  userCity,
  userVillage = 'Shivajinagar',
  userDistrict = 'Pune',
  userStateName = 'Maharashtra',
  isLocating,
  isLiveGPS,
  lastGpsUpdate,
  onRequestLocation,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState(false);

  const handleCopyLocationName = () => {
    const text = userAddress || `${userVillage}, ${userDistrict}, ${userStateName}`;
    navigator.clipboard.writeText(text);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2000);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Find Stations' },
    { id: 'bookings', label: 'My Bookings' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#101A2C]/95 backdrop-blur-md border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Brand Wordmark & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleLinkClick('home')}
              className="text-left flex items-center gap-2.5 group cursor-pointer press-effect"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 text-[#101A2C] flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 group-hover:shadow-emerald-500/20 transition-all duration-200">
                ⚡
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
                  ChargeGo
                </span>
                <span className="text-[10px] font-medium tracking-wider text-emerald-400 uppercase -mt-1 hidden sm:inline">
                  Smarter Stops. Cleaner Journeys.
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`transition-all duration-200 whitespace-nowrap shrink-0 py-1 cursor-pointer nav-link-animated ${
                  currentTab === link.id
                    ? 'text-emerald-400 font-semibold active'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={onOpenAbout}
              className="text-slate-300 hover:text-white transition-all duration-200 cursor-pointer nav-link-animated"
            >
              About
            </button>

            <button
              onClick={onOpenContact}
              className="text-slate-300 hover:text-white transition-all duration-200 cursor-pointer nav-link-animated"
            >
              Contact
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => handleLinkClick('admin')}
                className={`transition-all duration-200 whitespace-nowrap shrink-0 py-1 px-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'admin'
                    ? 'text-amber-300 font-semibold bg-amber-500/15 border border-amber-400/30'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Utility Cluster & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Top Corner: Live Location Indicator & Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLocationMenu(!showLocationMenu);
                  setShowNotifications(false);
                  setShowUserMenu(false);
                }}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer press-effect border ${
                  isLiveGPS
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-400'
                    : 'bg-slate-800/90 text-slate-200 border-slate-700/80 hover:bg-slate-700/90 hover:border-slate-600'
                }`}
                title="Your Live Location – Click to view exact coordinates or refresh GPS"
                aria-label="Live location details"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <MapPin className={`w-3.5 h-3.5 ${isLiveGPS ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    {isLiveGPS ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                    )}
                  </span>
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {isLiveGPS ? 'LIVE VILLAGE / AREA' : 'LOCALITY'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white max-w-[85px] xs:max-w-[110px] sm:max-w-[150px] truncate leading-tight">
                    {userVillage || userCity.replace(' (GPS)', '').replace(' (Default)', '') || 'Shivajinagar'}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                    showLocationMenu ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Live Location Dropdown Popover */}
              {showLocationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white text-slate-900 border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-4 text-xs animate-in fade-in zoom-in-95">
                  {/* Popover Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="font-extrabold text-slate-900 text-xs tracking-tight">
                        {isLiveGPS ? 'Live Location Name' : 'Corridor Locality'}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-slate-100">
                      {lastGpsUpdate ? `Updated ${lastGpsUpdate}` : 'Live'}
                    </span>
                  </div>

                  {/* Village & Locality Name Card */}
                  <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/70 mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="text-base">🏡</span>
                        <span>Village / Locality Name</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-200">
                        {isLiveGPS ? 'Live GPS Detected' : 'Local Area'}
                      </span>
                    </div>

                    <div className="text-base font-extrabold text-slate-900 tracking-tight">
                      {userVillage || userCity.split(',')[0] || 'Shivajinagar'}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200/50">
                      <span className="font-semibold text-slate-700">District: <span className="font-bold text-slate-900">{userDistrict || 'Pune'}</span></span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">State: <span className="font-bold text-slate-900">{userStateName || 'Maharashtra'}</span></span>
                    </div>
                  </div>

                  {/* Full Location Address & Copy Name */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 mb-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>Complete Location Name</span>
                      </span>

                      <button
                        onClick={handleCopyLocationName}
                        className="px-2 py-0.5 bg-white text-emerald-800 border border-emerald-300 rounded font-bold text-[10px] hover:bg-emerald-50 transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                        title="Copy location name to clipboard"
                      >
                        {copiedLocation ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5 text-emerald-700" />
                            <span>Copy Name</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="font-bold text-slate-800 text-xs leading-snug">
                      {userAddress}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        onRequestLocation();
                      }}
                      disabled={isLocating}
                      className="w-full py-2 px-3 bg-[#101A2C] hover:bg-slate-850 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-slate-800 disabled:opacity-50 press-effect shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Locating via GPS...' : 'Refresh Live Location'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowLocationMenu(false);
                        handleLinkClick('explore');
                      }}
                      className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-[#101A2C] rounded-xl font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors press-effect shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Find Stations Near Me</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    onMarkNotificationsRead();
                  }
                }}
                title="In-app Notifications"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 text-[#101A2C] text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Live Notifications</span>
                    <button
                      onClick={() => onMarkNotificationsRead()}
                      className="text-[11px] text-emerald-600 font-semibold hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors ${
                            notif.read ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50 text-emerald-950 font-medium border border-emerald-200/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 tabular-nums">{notif.date}</span>
                          </div>
                          <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/70 hover:border-slate-600 rounded-xl transition-all cursor-pointer press-effect"
              >
                {currentUser.role === 'admin' ? (
                  <Shield className="w-4 h-4 text-emerald-400" />
                ) : (
                  <User className="w-4 h-4 text-slate-300" />
                )}
                <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl text-slate-900 border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-2 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-slate-500 text-[11px] truncate">{currentUser.email}</div>
                    <div className="mt-1.5 text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span>Active Role:</span>
                      <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 capitalize border border-emerald-200/60 text-[10px]">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1.5">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Demo Role Switcher
                    </div>
                    <button
                      onClick={() => {
                        onSwitchRole('user');
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        currentUser.role === 'user'
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Driver Account (Rahul)</span>
                      </span>
                      {currentUser.role === 'user' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => {
                        onSwitchRole('admin');
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        currentUser.role === 'admin'
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        <span>Fleet Admin (Priya)</span>
                      </span>
                      {currentUser.role === 'admin' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer font-bold text-emerald-800 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sign In with ID & Password / Register</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenBookingDirect}
              className="px-4 py-2 text-xs font-bold text-[#101A2C] bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-md hover:shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer hover-lift-subtle press-effect"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 flex flex-col gap-2.5 animate-in slide-in-from-top-2">
            {/* Live Location Mobile Card */}
            <div className="bg-slate-850/90 p-3 rounded-2xl border border-slate-700/80 mb-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {isLiveGPS ? 'Live Village / Area' : 'Your Locality'}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[170px]">
                    {userVillage || userCity}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-300 truncate max-w-[170px]">
                    {userDistrict ? `${userDistrict}, ${userStateName}` : userAddress}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onRequestLocation()}
                disabled={isLocating}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-emerald-400 border border-slate-700 cursor-pointer disabled:opacity-50 transition-colors"
                title="Refresh Live Location"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-left px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  currentTab === link.id
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="text-left px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              About ChargeGo
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="text-left px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              Contact & Support
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => handleLinkClick('admin')}
                className="text-left px-4 py-2.5 text-sm font-semibold text-amber-400 bg-amber-500/10 rounded-xl flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

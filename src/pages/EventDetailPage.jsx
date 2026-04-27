import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Calendar, MapPin, Users, Clock, ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react';
import client from '../api/client';
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long', day: 'numeric',
    month: 'long', year: 'numeric'
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const BookButton = ({ event, booking, bookingSuccess, waitlistSuccess, bookingError, handleBook, user }) => { if (bookingSuccess) {
  return (
    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4">
      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
      <div>
        <p className="text-sm font-bold text-emerald-700">You're booked!</p>
        <p className="text-xs text-emerald-600 mt-0.5">A confirmation has been sent to your email.</p>
      </div>
    </div>
  );
}

if (waitlistSuccess) {
  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
      <Clock className="w-5 h-5 text-amber-500 shrink-0" />
      <div>
        <p className="text-sm font-bold text-amber-700">You're on the waitlist!</p>
        <p className="text-xs text-amber-600 mt-0.5">We'll notify you if a spot becomes available.</p>
      </div>
    </div>
  );
}

  const spotsLeft = event.capacity ? event.capacity - event.booking_count : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

if (isFull && !waitlistSuccess) {
  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4">
        <p className="text-sm font-bold text-red-500">This event is fully booked.</p>
        <p className="text-xs text-red-400 mt-1">You can still join the waitlist.</p>
      </div>
      <button
        onClick={handleBook}
        disabled={booking}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-4 rounded-sm flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.3em] uppercase transition-all"
      >
        {booking ? 'Joining...' : 'Join Waitlist'}
      </button>
      {bookingError && <p className="text-xs text-red-500">{bookingError}</p>}
    </div>
  );
}

if (event.calendly_link) {
  return (
    <div className="space-y-3">
      <button
        onClick={() => {
          handleBook();
          try {
            const url = new URL(event.calendly_link);
            // Prefill CEO name + email
            if (user?.name) url.searchParams.set('name', user.name);
            if (user?.email) url.searchParams.set('email', user.email);
            // Prefill event date
            if (event.date) {
              const dateKey = new Date(event.date).toISOString().split('T')[0];
              url.searchParams.set('date', dateKey);
            }
            // Prefill event time
            if (event.time) {
              url.searchParams.set('time', event.time.slice(0, 5));
            }
            // ILC brand colors
            url.searchParams.set('background_color', '1a0525');
            url.searchParams.set('text_color', 'ffffff');
            url.searchParams.set('primary_color', 'EDA300');
            window.open(url.toString(), '_blank');
          } catch (err) {
            window.open(event.calendly_link, '_blank');
          }
        }}
        className="w-full bg-[#2a0b38] hover:bg-[#1a0525] text-white py-4 rounded-sm flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.3em] uppercase transition-all"
      >
        Book via Calendly
        <ExternalLink className="w-4 h-4 text-[#EDA300]" />
      </button>
      <p className="text-[10px] text-gray-400 text-center">
        Your details will be pre-filled. Event date and time auto-selected.
      </p>
      {bookingError && <p className="text-xs text-red-500">{bookingError}</p>}
    </div>
  );
}

  return (
    <div className="space-y-3">
      <button
        onClick={handleBook}
        disabled={booking}
        className="w-full bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-4 rounded-sm flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.3em] uppercase transition-all"
      >
        {booking ? 'Confirming...' : 'Confirm Attendance'}
      </button>
      {bookingError && <p className="text-xs text-red-500">{bookingError}</p>}
    </div>
  );
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
const [bookingSuccess, setBookingSuccess] = useState(false);
const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await client.get(`/events/${id}`);
        setEvent(res.data.event);
        setAttendees(res.data.attendees);
if (res.data.event.is_booked === 1) setBookingSuccess(true);
if (res.data.event.is_waitlisted === 1) setWaitlistSuccess(true);
      } catch (err) {
        setError('Event not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBook = async () => {
    setBooking(true);
    setBookingError('');
    try {
      const bookRes = await client.post(`/events/${id}/book`);
if (bookRes.data.status === 'WAITLIST') {
  setWaitlistSuccess(true);
} else {
  setBookingSuccess(true);
}
      const res = await client.get(`/events/${id}`);
      setEvent(res.data.event);
      setAttendees(res.data.attendees);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading event...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  const spotsLeft = event.capacity ? event.capacity - event.booking_count : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="py-12 max-w-4xl space-y-8">

      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-gray-400 hover:text-[#2a0b38] transition-colors text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        All Events
      </button>

      <div className="bg-[#1a0525] rounded-xl p-6 lg:p-10 text-white space-y-4">
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest">ILC Event</p>
        <h1 className="text-4xl font-serif font-bold leading-tight">{event.title}</h1>
        <div className="flex flex-wrap gap-6 pt-2">
          <span className="flex items-center gap-2 text-gray-300 text-sm">
            <Calendar className="w-4 h-4 text-[#EDA300]" />
            {formatDate(event.date)}
          </span>
          {event.time && (
            <span className="flex items-center gap-2 text-gray-300 text-sm">
              <Clock className="w-4 h-4 text-[#EDA300]" />
              {formatTime(event.time)}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-2 text-gray-300 text-sm">
              <MapPin className="w-4 h-4 text-[#EDA300]" />
              {event.location}
            </span>
          )}
          {event.capacity && (
            <span className="flex items-center gap-2 text-gray-300 text-sm">
              <Users className="w-4 h-4 text-[#EDA300]" />
              {isFull ? 'Fully booked' : `${spotsLeft} of ${event.capacity} spots left`}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
  <div className="lg:col-span-2 space-y-6">
          {event.description && (
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                About This Event
              </p>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Reserve Your Spot
            </p>
<BookButton
  event={event}
  booking={booking}
  bookingSuccess={bookingSuccess}
  waitlistSuccess={waitlistSuccess}
  bookingError={bookingError}
  handleBook={handleBook}
  user={user}
/>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm sticky top-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              Attending ({attendees.length})
            </p>
            {attendees.length === 0 ? (
              <p className="text-gray-300 text-xs">No bookings yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {attendees.map(person => (
                  <div key={person.id} className="flex items-center gap-3">
                    {person.photo_url ? (
                      <img
                        src={person.photo_url}
                        alt={person.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1a0525] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {person.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2a0b38] truncate">{person.name}</p>
                      {person.title && (
                        <p className="text-[10px] text-gray-400 truncate">{person.title}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
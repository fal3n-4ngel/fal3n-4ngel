"use client";

import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { useFollowPointer } from "@/hooks";
import FadeUp from "@/components/ui/FadeUp";
import React, { useState, useEffect, useRef } from "react";
import { RiCalendarCheckLine, RiTimeLine, RiLoader4Line } from "react-icons/ri";

interface BusySlot {
  start: string;
  end: string;
}

export default function BookMeetingPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useFollowPointer(ref);

  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [duration, setDuration] = useState<15 | 30 | 60>(30);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Get next 7 weekdays (skipping Saturday and Sunday)
  const getNextWeekdays = () => {
    const dates: Date[] = [];
    let current = new Date();
    // Start from tomorrow
    current.setDate(current.getDate() + 1);

    while (dates.length < 7) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const weekdays = getNextWeekdays();

  useEffect(() => {
    if (weekdays.length > 0 && !selectedDate) {
      setSelectedDate(weekdays[0] || null);
    }
  }, [weekdays, selectedDate]);

  // Fetch busy slots for the next 7 days
  useEffect(() => {
    const fetchBusy = async () => {
      setLoading(true);
      try {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 10);
        const res = await fetch(`/api/calendar/book?start=${start.toISOString()}&end=${end.toISOString()}`);
        if (res.ok) {
          const data = await res.json();
          setBusySlots(data);
        }
      } catch (err) {
        console.error("Failed to fetch busy slots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusy();
  }, []);

  // Generate slots for the selected date from 9:00 AM to 5:00 PM IST
  const generateSlots = (date: Date) => {
    const slots: Date[] = [];
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

    // 9:00 to 24:00 IST (UTC +5:30)
    for (let hour = 9; hour < 24; hour++) {
      for (let min of [0, 30]) {
        // Construct the IST time string
        // Pad hour and minute
        const hrStr = String(hour).padStart(2, "0");
        const minStr = String(min).padStart(2, "0");
        const slotDate = new Date(`${dateStr}T${hrStr}:${minStr}:00+05:30`);
        slots.push(slotDate);
      }
    }
    return slots;
  };

  const checkSlotBusy = (slotStart: Date) => {
    const slotStartMs = slotStart.getTime();
    const slotEndMs = slotStartMs + duration * 60 * 1000;

    return busySlots.some((busy) => {
      const busyStart = new Date(busy.start).getTime();
      const busyEnd = new Date(busy.end).getTime();
      // Overlap condition
      return slotStartMs < busyEnd && slotEndMs > busyStart;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          dateTime: selectedSlot.toISOString(),
          description: notes,
          duration,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setErrorMsg(data.message || "Failed to book meeting");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeSlots = selectedDate ? generateSlots(selectedDate) : [];

  return (
    <div className="flex h-full min-h-screen w-full flex-col justify-between bg-black text-white" ref={ref}>
      <Navbar />
      <CustomCursor x={x} y={y} />

      <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-32 sm:px-8 md:px-12 md:pt-40">
        <div className="mb-12 space-y-4">
          <FadeUp>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
                Scheduling
              </h1>
            </div>
          </FadeUp>
          <FadeUp>
            <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl">
              Book a Virtual Meeting
            </h2>
          </FadeUp>
          <FadeUp>
            <p className="max-w-2xl text-sm font-light text-neutral-400 md:text-base">
              Select a date and time slot to sync with me. Slots are defined in Asia/Kolkata (IST) but displayed below in your local browser timezone.
            </p>
          </FadeUp>
        </div>

        {success ? (
          <FadeUp>
            <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-white/10 bg-white/[0.02] p-12 text-center">
              <div className="rounded-full bg-green-500/10 p-4 text-green-500">
                <RiCalendarCheckLine className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-light text-white">Meeting Scheduled!</h3>
              <p className="max-w-md text-sm text-neutral-400 font-light leading-relaxed">
                Thank you! An invite has been successfully added to my Google Calendar. You will receive a calendar invitation shortly.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setSelectedSlot(null);
                  setName("");
                  setEmail("");
                  setNotes("");
                }}
                className="interactable border border-white/10 bg-white/[0.03] px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-neutral-300 transition hover:bg-white/10 hover:text-white"
              >
                Book Another Meeting
              </button>
            </div>
          </FadeUp>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left side: Date & Time Selector */}
            <div className="space-y-8 lg:col-span-7">
              {/* Duration selector */}
              <FadeUp>
                <div className="space-y-3">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Step 1: Choose Duration
                  </label>
                  <div className="flex gap-4">
                    {([15, 30, 60] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setDuration(d);
                          setSelectedSlot(null);
                        }}
                        className={`interactable flex-1 border py-3 font-mono text-xs uppercase tracking-wider transition ${
                          duration === d
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/10 bg-white/[0.01] text-neutral-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {d} mins
                      </button>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* Date selector */}
              <FadeUp>
                <div className="space-y-3">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Step 2: Choose Date
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {weekdays.map((date) => {
                      const isSelected =
                        selectedDate && selectedDate.toDateString() === date.toDateString();
                      return (
                        <button
                          key={date.toDateString()}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlot(null);
                          }}
                          className={`interactable shrink-0 border px-4 py-3.5 flex flex-col items-center gap-1.5 transition ${
                            isSelected
                              ? "border-white bg-white text-black font-semibold"
                              : "border-white/10 bg-white/[0.01] text-neutral-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span className="font-mono text-[9px] uppercase tracking-wider">
                            {date.toLocaleDateString([], { weekday: "short" })}
                          </span>
                          <span className="text-lg leading-none font-light">
                            {date.getDate()}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider">
                            {date.toLocaleDateString([], { month: "short" })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </FadeUp>

              {/* Time Slots */}
              <FadeUp>
                <div className="space-y-3">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                    Step 3: Choose Time Slot
                    {loading && <RiLoader4Line className="animate-spin text-neutral-400 h-3.5 w-3.5" />}
                  </label>

                  {loading ? (
                    <div className="py-12 border border-white/10 bg-white/[0.01] rounded-sm text-center flex flex-col items-center justify-center gap-2">
                      <RiLoader4Line className="h-6 w-6 animate-spin text-neutral-500" />
                      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                        Checking availability...
                      </p>
                    </div>
                  ) : activeSlots.length === 0 ? (
                    <div className="py-12 border border-white/10 bg-white/[0.01] rounded-sm text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                      No slots available
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      {activeSlots.map((slot) => {
                        const isBusy = checkSlotBusy(slot);
                        const isSelected = selectedSlot && selectedSlot.getTime() === slot.getTime();
                        return (
                          <button
                            key={slot.toISOString()}
                            disabled={isBusy}
                            onClick={() => setSelectedSlot(slot)}
                            className={`interactable py-3 text-center text-xs font-mono tracking-wider border rounded-sm transition ${
                              isBusy
                                ? "border-white/5 bg-transparent text-neutral-700 cursor-not-allowed line-through"
                                : isSelected
                                ? "border-white bg-white text-black font-semibold"
                                : "border-white/10 bg-white/[0.02] text-neutral-300 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            {slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </FadeUp>
            </div>

            {/* Right side: Input Form */}
            <div className="lg:col-span-5">
              <FadeUp>
                <div className="border border-white/10 bg-white/[0.01] rounded-lg p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <RiTimeLine className="h-5 w-5 text-neutral-400" />
                    <div>
                      <h3 className="text-sm font-mono uppercase tracking-wider text-neutral-300">
                        Booking Details
                      </h3>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase mt-0.5">
                        {selectedSlot ? (
                          <>
                            {selectedSlot.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                            {" @ "}
                            {selectedSlot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {` (${duration} mins)`}
                          </>
                        ) : (
                          "Please select a time slot"
                        )}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        disabled={!selectedSlot || submitting}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white/[0.02] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30 text-white rounded-sm disabled:cursor-not-allowed disabled:opacity-50 font-light"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        disabled={!selectedSlot || submitting}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-white/[0.02] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30 text-white rounded-sm disabled:cursor-not-allowed disabled:opacity-50 font-light"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                        Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        disabled={!selectedSlot || submitting}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tell me what you would like to discuss..."
                        className="w-full bg-white/[0.02] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/30 text-white rounded-sm disabled:cursor-not-allowed disabled:opacity-50 font-light resize-none"
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-red-500 font-mono text-center">{errorMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={!selectedSlot || submitting}
                      className="interactable w-full py-4 text-center text-xs font-mono uppercase tracking-widest text-black bg-white hover:bg-neutral-200 transition font-bold disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Booking..." : "Confirm Booking"}
                    </button>
                  </form>
                </div>
              </FadeUp>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { seedBookings, seedDisputes, seedTrucks, seedUsers } from "./mock-data";
import {
  ACTIVE_BOOKING_STATUSES,
  type Booking,
  type BookingStatus,
  type Dispute,
  type Role,
  type Truck,
  type TruckStatus,
  type User,
} from "./types";

const STORAGE_KEY = "ibanga-mvp-v3";

type State = {
  users: User[];
  trucks: Truck[];
  bookings: Booking[];
  disputes: Dispute[];
  currentUserId: string | null;
};

type NewBookingInput = Omit<Booking, "id" | "status" | "createdAt">;
type NewTruckInput = Omit<Truck, "id" | "status"> & { status?: TruckStatus };

type Store = State & {
  ready: boolean;
  currentUser: User | null;
  login: (email: string) => string | null;
  loginAs: (userId: string) => void;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    location: string;
    company: string;
    role: Exclude<Role, "ADMIN">;
  }) => string | null;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "phone" | "location" | "company" | "photo">>) => void;
  addTruck: (input: NewTruckInput) => string;
  updateTruck: (id: string, patch: Partial<Omit<Truck, "id" | "ownerId">>) => string | null;
  deleteTruck: (id: string) => string | null;
  setAvailability: (id: string, status: TruckStatus) => string | null;
  createBooking: (input: NewBookingInput) => string | null;
  setAgreedPrice: (id: string, price: string) => string | null;
  setBookingStatus: (id: string, status: BookingStatus) => string | null;
  reportProblem: (bookingId: string, reason: string) => string | null;
  resolveDispute: (disputeId: string, notes: string) => string | null;
  setUserActive: (userId: string, active: boolean) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function seed(): State {
  return {
    users: seedUsers,
    trucks: seedTrucks,
    bookings: seedBookings,
    disputes: seedDisputes,
    currentUserId: null,
  };
}

function hasActiveTrip(bookings: Booking[], truckId: string, exceptId?: string) {
  return bookings.some(
    (b) =>
      b.truckId === truckId &&
      b.id !== exceptId &&
      ACTIVE_BOOKING_STATUSES.includes(b.status),
  );
}

export function IbangaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as State);
    } catch {
      /* keep seed */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const currentUser =
    state.users.find((u) => u.id === state.currentUserId && u.active) ?? null;

  const login = useCallback((email: string) => {
    const user = state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) return "No account found for that email.";
    if (!user.active) return "This account is suspended. Contact iBanga admin.";
    setState((s) => ({ ...s, currentUserId: user.id }));
    return null;
  }, [state.users]);

  const loginAs = useCallback((userId: string) => {
    setState((s) => ({ ...s, currentUserId: userId }));
  }, []);

  const register = useCallback<Store["register"]>((input) => {
    if (state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return "That email is already registered.";
    }
    const user: User = {
      id: uid("u"),
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      location: input.location,
      company: input.company,
      active: true,
    };
    setState((s) => ({
      ...s,
      users: [...s.users, user],
      currentUserId: user.id,
    }));
    return null;
  }, [state.users]);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUserId: null }));
  }, []);

  const updateProfile = useCallback<Store["updateProfile"]>((patch) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === s.currentUserId ? { ...u, ...patch } : u,
      ),
    }));
  }, []);

  const addTruck = useCallback<Store["addTruck"]>((input) => {
    const id = uid("t");
    const truck: Truck = {
      ...input,
      id,
      status: input.status ?? "AVAILABLE",
      photos: (input.photos ?? []).slice(0, 2),
    };
    setState((s) => ({ ...s, trucks: [...s.trucks, truck] }));
    return id;
  }, []);

  const updateTruck = useCallback<Store["updateTruck"]>((id, patch) => {
    const truck = state.trucks.find((t) => t.id === id);
    if (!truck) return "Truck not found.";
    if (currentUser?.role === "TRUCK_OWNER" && truck.ownerId !== currentUser.id) {
      return "You can only edit your own trucks.";
    }
    setState((s) => ({
      ...s,
      trucks: s.trucks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
    return null;
  }, [currentUser, state.trucks]);

  const deleteTruck = useCallback<Store["deleteTruck"]>((id) => {
    const truck = state.trucks.find((t) => t.id === id);
    if (!truck) return "Truck not found.";
    if (hasActiveTrip(state.bookings, id)) {
      return "Cannot delete a truck with an active trip.";
    }
    setState((s) => ({ ...s, trucks: s.trucks.filter((t) => t.id !== id) }));
    return null;
  }, [state.bookings, state.trucks]);

  const setAvailability = useCallback<Store["setAvailability"]>((id, status) => {
    if (status === "AVAILABLE" && hasActiveTrip(state.bookings, id)) {
      return "This truck has an active trip. It becomes available only after the importer confirms receipt, or after admin resolves a dispute.";
    }
    setState((s) => ({
      ...s,
      trucks: s.trucks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    return null;
  }, [state.bookings]);

  const createBooking = useCallback<Store["createBooking"]>((input) => {
    const truck = state.trucks.find((t) => t.id === input.truckId);
    if (!truck) return "Truck not found.";
    if (truck.status !== "AVAILABLE") return "This truck is not available to book.";
    if (hasActiveTrip(state.bookings, truck.id)) {
      return "This truck already has an active booking.";
    }
    const booking: Booking = {
      ...input,
      id: uid("b"),
      agreedPrice: input.agreedPrice ?? "",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({
      ...s,
      bookings: [booking, ...s.bookings],
      trucks: s.trucks.map((t) =>
        t.id === truck.id ? { ...t, status: "UNAVAILABLE" } : t,
      ),
    }));
    return null;
  }, [state.bookings, state.trucks]);

  const setAgreedPrice = useCallback((id: string, price: string) => {
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) return "Booking not found.";
    if (booking.status !== "PENDING") {
      return "Price can only be set while the request is pending.";
    }
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) =>
        b.id === id ? { ...b, agreedPrice: price.trim() } : b,
      ),
    }));
    return null;
  }, [state.bookings]);

  const setBookingStatus = useCallback<Store["setBookingStatus"]>((id, status) => {
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) return "Booking not found.";
    if (status === "ACCEPTED" && !booking.agreedPrice.trim()) {
      return "Agree a price first, then accept or reject.";
    }

    setState((s) => {
      let trucks = s.trucks;
      let bookings = s.bookings.map((b) => (b.id === id ? { ...b, status } : b));

      if (status === "ACCEPTED") {
        trucks = trucks.map((t) =>
          t.id === booking.truckId ? { ...t, status: "UNAVAILABLE" } : t,
        );
      }
      if (status === "REJECTED") {
        trucks = trucks.map((t) =>
          t.id === booking.truckId ? { ...t, status: "AVAILABLE" } : t,
        );
      }
      if (status === "COMPLETED") {
        trucks = trucks.map((t) =>
          t.id === booking.truckId ? { ...t, status: "AVAILABLE" } : t,
        );
      }
      return { ...s, trucks, bookings };
    });
    return null;
  }, [state.bookings]);

  const reportProblem = useCallback<Store["reportProblem"]>((bookingId, reason) => {
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return "Booking not found.";
    const dispute: Dispute = {
      id: uid("d"),
      bookingId,
      raisedBy: booking.importerId,
      reason,
      status: "OPEN",
      resolutionNotes: "",
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({
      ...s,
      disputes: [dispute, ...s.disputes],
      bookings: s.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "DISPUTED" } : b,
      ),
      trucks: s.trucks.map((t) =>
        t.id === booking.truckId ? { ...t, status: "UNAVAILABLE" } : t,
      ),
    }));
    return null;
  }, [state.bookings]);

  const resolveDispute = useCallback<Store["resolveDispute"]>((disputeId, notes) => {
    const dispute = state.disputes.find((d) => d.id === disputeId);
    if (!dispute) return "Dispute not found.";
    const booking = state.bookings.find((b) => b.id === dispute.bookingId);
    setState((s) => ({
      ...s,
      disputes: s.disputes.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: "RESOLVED",
              resolutionNotes: notes,
              resolvedAt: new Date().toISOString(),
            }
          : d,
      ),
      bookings: s.bookings.map((b) =>
        b.id === dispute.bookingId ? { ...b, status: "COMPLETED" } : b,
      ),
      trucks: s.trucks.map((t) =>
        booking && t.id === booking.truckId ? { ...t, status: "AVAILABLE" } : t,
      ),
    }));
    return null;
  }, [state.bookings, state.disputes]);

  const setUserActive = useCallback((userId: string, active: boolean) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === userId ? { ...u, active } : u)),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    const next = seed();
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      ready,
      currentUser,
      login,
      loginAs,
      register,
      logout,
      updateProfile,
      addTruck,
      updateTruck,
      deleteTruck,
      setAvailability,
      createBooking,
      setAgreedPrice,
      setBookingStatus,
      reportProblem,
      resolveDispute,
      setUserActive,
      resetDemo,
    }),
    [
      state,
      ready,
      currentUser,
      login,
      loginAs,
      register,
      logout,
      updateProfile,
      addTruck,
      updateTruck,
      deleteTruck,
      setAvailability,
      createBooking,
      setAgreedPrice,
      setBookingStatus,
      reportProblem,
      resolveDispute,
      setUserActive,
      resetDemo,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useIbanga() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useIbanga must be used inside IbangaProvider");
  return ctx;
}

export function dashboardPath(role: Role) {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "TRUCK_OWNER") return "/dashboard/owner";
  return "/dashboard/importer";
}

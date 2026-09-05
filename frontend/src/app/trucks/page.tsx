"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLink } from "@/components/brand";
import { TruckCard } from "@/components/truck-card";
import { Field, inputClass } from "@/components/ui";
import { useIbanga } from "@/lib/store";
import { LOCATIONS, TRUCK_TYPES } from "@/lib/types";

export default function TrucksPage() {
  const { trucks, users, currentUser } = useIbanga();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [route, setRoute] = useState("");
  const [capacity, setCapacity] = useState("");

  const results = useMemo(() => {
    return trucks.filter((t) => {
      if (t.status !== "AVAILABLE") return false;
      if (location && t.currentLocation !== location) return false;
      if (type && t.truckType !== type) return false;
      if (
        route &&
        !t.preferredRoute.toLowerCase().includes(route.toLowerCase())
      ) {
        return false;
      }
      if (
        capacity &&
        !t.capacity.toLowerCase().includes(capacity.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [trucks, location, type, route, capacity]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <BrandLink />
          <Link
            href={currentUser ? "/dashboard/importer" : "/login"}
            className="text-sm font-semibold text-brand"
          >
            {currentUser ? "Dashboard" : "Log in"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl text-navy">Available trucks</h1>
        <p className="mt-2 text-muted">
        Only trucks marked available appear here. A booking holds a truck
        until the owner rejects — or the trip is fully finished.
        </p>

        <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Location">
            <select
              className={inputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Any</option>
              {LOCATIONS.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
          </Field>
          <Field label="Truck type">
            <select
              className={inputClass}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Any</option>
              {TRUCK_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Route contains">
            <input
              className={inputClass}
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="Mombasa"
            />
          </Field>
          <Field label="Capacity contains">
            <input
              className={inputClass}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="28 tons"
            />
          </Field>
        </div>

        <p className="mt-6 text-sm text-muted">{results.length} trucks</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((truck) => (
            <TruckCard
              key={truck.id}
              truck={truck}
              owner={users.find((u) => u.id === truck.ownerId)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

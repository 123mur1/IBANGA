"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { TruckBadge } from "@/components/status-badge";
import { TruckPhotos } from "@/components/photos";
import { EmptyState, GhostButton } from "@/components/ui";
import { useIbanga } from "@/lib/store";

export default function OwnerTrucksPage() {
  const { currentUser, trucks, deleteTruck, setAvailability } = useIbanga();
  const mine = trucks.filter((t) => t.ownerId === currentUser?.id);

  return (
    <RequireAuth role="TRUCK_OWNER">
      <DashboardShell role="TRUCK_OWNER">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-navy">My trucks</h1>
            <p className="mt-1 text-muted">
              Unavailable trucks do not show in importer search.
            </p>
          </div>
          <Link
            href="/dashboard/owner/trucks/new"
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
          >
            Add truck
          </Link>
        </div>
        <div className="mt-6 space-y-3">
          {mine.length ? (
            mine.map((truck) => (
              <div
                key={truck.id}
                className="rounded-2xl border border-line bg-card p-5"
              >
                <TruckPhotos
                  photos={truck.photos}
                  alt={truck.plateNumber}
                  className="h-32"
                />
                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl text-navy">
                      {truck.plateNumber}
                    </p>
                    <p className="text-sm text-muted">
                      {truck.truckType} · {truck.capacity} · {truck.currentLocation}
                    </p>
                    <p className="mt-1 text-sm">{truck.preferredRoute}</p>
                  </div>
                  <TruckBadge status={truck.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/owner/trucks/${truck.id}/edit`}
                    className="rounded-xl border border-line px-3 py-2 text-sm font-semibold"
                  >
                    Edit
                  </Link>
                  <GhostButton
                    type="button"
                    onClick={() =>
                      setAvailability(
                        truck.id,
                        truck.status === "AVAILABLE"
                          ? "UNAVAILABLE"
                          : "AVAILABLE",
                      )
                    }
                  >
                    Mark{" "}
                    {truck.status === "AVAILABLE" ? "unavailable" : "available"}
                  </GhostButton>
                  <GhostButton
                    type="button"
                    onClick={() => deleteTruck(truck.id)}
                  >
                    Delete
                  </GhostButton>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No trucks listed"
              text="Add a truck with plate, type, capacity, location and route."
            />
          )}
        </div>
      </DashboardShell>
    </RequireAuth>
  );
}

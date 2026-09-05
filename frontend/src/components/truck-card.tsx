import Link from "next/link";
import { TruckBadge } from "./status-badge";
import { Avatar, TruckPhotos } from "./photos";
import type { Truck, User } from "@/lib/types";

export function TruckCard({
  truck,
  owner,
}: {
  truck: Truck;
  owner?: User;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-card">
      <TruckPhotos photos={truck.photos} alt={truck.plateNumber} className="h-40" />
      <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg text-navy">{truck.truckType}</p>
          <p className="text-sm text-muted">{truck.plateNumber}</p>
        </div>
        <TruckBadge status={truck.status} />
      </div>
      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Capacity</dt>
          <dd className="font-medium text-navy">{truck.capacity}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Now in</dt>
          <dd className="font-medium text-navy">{truck.currentLocation}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Route</dt>
          <dd className="text-right font-medium text-navy">
            {truck.preferredRoute}
          </dd>
        </div>
        {owner ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Owner</dt>
            <dd className="flex items-center gap-2 font-medium text-navy">
              <Avatar src={owner.photo} name={owner.name} size="sm" />
              {owner.name}
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-4 line-clamp-2 text-sm text-muted">{truck.description}</p>
      <Link
        href={`/trucks/${truck.id}`}
        className="mt-5 inline-flex rounded-xl bg-navy px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-navy-soft"
      >
        View details
      </Link>
      </div>
    </article>
  );
}

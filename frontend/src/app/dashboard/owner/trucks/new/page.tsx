"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { Field, inputClass, PrimaryButton } from "@/components/ui";
import { TruckPhotos, readImageFile } from "@/components/photos";
import { useIbanga } from "@/lib/store";
import { TRUCK_TYPES } from "@/lib/types";

export default function NewTruckPage() {
  const { currentUser, addTruck } = useIbanga();
  const router = useRouter();
  const [form, setForm] = useState({
    plateNumber: "",
    truckType: "Container",
    capacity: "",
    currentLocation: "",
    preferredRoute: "",
    description: "",
    photos: [] as string[],
  });

  async function addPhoto(file: File | undefined) {
    if (!file || form.photos.length >= 2) return;
    const src = await readImageFile(file);
    setForm({ ...form, photos: [...form.photos, src] });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    addTruck({ ...form, ownerId: currentUser.id });
    router.push("/dashboard/owner/trucks");
  }

  return (
    <RequireAuth role="TRUCK_OWNER">
      <DashboardShell role="TRUCK_OWNER">
        <h1 className="font-display text-3xl text-navy">Add a truck</h1>
        <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-4">
          <Field label="Plate number">
            <input
              className={inputClass}
              required
              value={form.plateNumber}
              onChange={(e) =>
                setForm({ ...form, plateNumber: e.target.value })
              }
            />
          </Field>
          <Field label="Truck type">
            <select
              className={inputClass}
              value={form.truckType}
              onChange={(e) => setForm({ ...form, truckType: e.target.value })}
            >
              {TRUCK_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Capacity">
            <input
              className={inputClass}
              required
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              placeholder="28 tons"
            />
          </Field>
          <Field label="Current location">
            <input
              className={inputClass}
              required
              value={form.currentLocation}
              onChange={(e) =>
                setForm({ ...form, currentLocation: e.target.value })
              }
            />
          </Field>
          <Field label="Preferred route / region">
            <input
              className={inputClass}
              required
              value={form.preferredRoute}
              onChange={(e) =>
                setForm({ ...form, preferredRoute: e.target.value })
              }
            />
          </Field>
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-24`}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
          <Field label="Photos (1 or 2)">
            <input
              className="text-sm"
              type="file"
              accept="image/*"
              onChange={(e) => addPhoto(e.target.files?.[0])}
            />
            <p className="mt-1 text-xs text-muted">
              Add one, then another if you want. Demo stores them in this browser.
            </p>
            {form.photos.length ? (
              <div className="mt-3">
                <TruckPhotos photos={form.photos} alt="New truck" className="h-28" />
              </div>
            ) : null}
          </Field>
          <PrimaryButton type="submit">Save truck</PrimaryButton>
        </form>
      </DashboardShell>
    </RequireAuth>
  );
}

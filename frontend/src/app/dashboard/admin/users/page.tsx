"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { GhostButton } from "@/components/ui";
import { useIbanga } from "@/lib/store";

export default function AdminUsersPage() {
  const { users, setUserActive } = useIbanga();

  return (
    <RequireAuth role="ADMIN">
      <DashboardShell role="ADMIN">
        <h1 className="font-display text-3xl text-navy">Users</h1>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{user.name}</p>
                    <p className="text-muted">{user.company}</p>
                  </td>
                  <td className="px-4 py-3">{user.role.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    {user.email}
                    <br />
                    {user.phone}
                  </td>
                  <td className="px-4 py-3">
                    {user.active ? "Active" : "Suspended"}
                  </td>
                  <td className="px-4 py-3">
                    {user.role !== "ADMIN" ? (
                      <GhostButton
                        type="button"
                        onClick={() => setUserActive(user.id, !user.active)}
                      >
                        {user.active ? "Suspend" : "Reactivate"}
                      </GhostButton>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardShell>
    </RequireAuth>
  );
}

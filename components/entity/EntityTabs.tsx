"use client";

import { useMemo, useState } from "react";
import { ActivitiesTab } from "@/components/entity/ActivitiesTab";
import { PlayersTab } from "@/components/entity/PlayersTab";
import { PlayerUsernamesTab } from "@/components/entity/PlayerUsernamesTab";
import { PlayerAccountsTab } from "@/components/entity/PlayerAccountsTab";

type EntityTabKey = "activities" | "players" | "usernames" | "accounts";

interface EntityTabsProps {
  entityId: string;
  actorUserId: string;
  restrictedEntityId?: string | null;
}

export function EntityTabs({ entityId, actorUserId, restrictedEntityId }: EntityTabsProps) {
  const tabs = useMemo(
    () =>
      [
        { key: "activities" as const, label: "Activities" },
        { key: "players" as const, label: "Players" },
        { key: "usernames" as const, label: "Players Usernames" },
        { key: "accounts" as const, label: "Player Accounts" },
      ] as const,
    []
  );

  const [active, setActive] = useState<EntityTabKey>("activities");

  const baseTab =
    "relative -mb-px whitespace-nowrap px-1 pb-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900";
  const activeTab = "text-gray-100 border-b-2 border-slate-400";
  const inactiveTab = "text-gray-400 border-b-2 border-transparent hover:text-gray-200 hover:border-gray-600";

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-max border-b border-gray-700">
          <div className="flex gap-6 px-1" role="tablist" aria-label="Entity tabs">
            {tabs.map((t) => {
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(t.key)}
                  className={`${baseTab} ${isActive ? activeTab : inactiveTab}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {active === "activities" && (
        <ActivitiesTab
          entityId={entityId}
          actorUserId={actorUserId}
          restrictedEntityId={restrictedEntityId}
        />
      )}
      {active === "players" && <PlayersTab entityId={entityId} />}
      {active === "usernames" && <PlayerUsernamesTab entityId={entityId} />}
      {active === "accounts" && <PlayerAccountsTab entityId={entityId} />}
    </div>
  );
}


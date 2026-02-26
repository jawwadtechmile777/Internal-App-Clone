"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDepartmentSlug, getDefaultDashboardHref } from "@/lib/roleGuard";
import { isSupportSlug, isExecutiveSlug } from "@/lib/roleConfig";
import * as entityService from "@/services/entityService";
import { EntityTabs } from "@/components/entity/EntityTabs";

interface EntityLayoutProps {
  entityId: string;
  /** Base support route for current role (e.g. /dashboard/support or /dashboard/executive/support) */
  supportBasePath: string;
}

export function EntityLayout({ entityId, supportBasePath }: EntityLayoutProps) {
  const { user, loading } = useAuth();
  const [entity, setEntity] = useState<entityService.EntityOption | null>(null);
  const [entityLoading, setEntityLoading] = useState(true);
  const [entityError, setEntityError] = useState<string | null>(null);

  const slug = useMemo(() => getDepartmentSlug(user ?? null), [user]);

  useEffect(() => {
    if (loading) return;
    if (!user || !slug) return;

    if (isSupportSlug(slug)) {
      const assigned = user.entity_id;
      if (!assigned) {
        window.location.href = supportBasePath;
        return;
      }
      if (assigned !== entityId) {
        window.location.href = `${supportBasePath}/${assigned}`;
      }
      return;
    }

    if (isExecutiveSlug(slug)) {
      return;
    }

    window.location.href = getDefaultDashboardHref(user);
  }, [loading, user, slug, entityId, supportBasePath]);

  useEffect(() => {
    let active = true;
    setEntityLoading(true);
    setEntityError(null);
    entityService
      .fetchEntityById(entityId)
      .then((e) => {
        if (!active) return;
        setEntity(e);
      })
      .catch((e) => {
        if (!active) return;
        setEntityError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!active) return;
        setEntityLoading(false);
      });
    return () => {
      active = false;
    };
  }, [entityId]);

  const restrictedEntityId = slug && isSupportSlug(slug) ? user?.entity_id : null;

  if (loading || entityLoading) {
    return (
      <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-10 text-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (entityError) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-4 text-sm text-red-300">
        {entityError}
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="rounded-xl border border-gray-700 bg-slate-800/50 px-4 py-10 text-center text-sm text-gray-400">
        Entity not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-700 bg-slate-800/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-100">{entity.name}</h1>
            <p className="mt-1 text-xs text-gray-500">
              Entity ID: <span className="font-mono">{entity.id}</span>
            </p>
          </div>
          <div className="text-xs text-gray-500">
            {slug ? `Role: ${slug}` : ""}
          </div>
        </div>
      </div>

      {user && (
        <EntityTabs
          entityId={entityId}
          actorUserId={user.id}
          restrictedEntityId={restrictedEntityId}
        />
      )}
    </div>
  );
}


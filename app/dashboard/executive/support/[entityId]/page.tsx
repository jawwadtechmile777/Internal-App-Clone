"use client";

import { EntityLayout } from "@/components/entity/EntityLayout";

export default function ExecutiveSupportEntityPage({ params }: { params: { entityId: string } }) {
  return <EntityLayout entityId={params.entityId} supportBasePath="/dashboard/executive/support" />;
}


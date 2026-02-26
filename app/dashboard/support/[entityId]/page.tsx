"use client";

import { EntityLayout } from "@/components/entity/EntityLayout";

export default function SupportEntityPage({ params }: { params: { entityId: string } }) {
  return <EntityLayout entityId={params.entityId} supportBasePath="/dashboard/support" />;
}


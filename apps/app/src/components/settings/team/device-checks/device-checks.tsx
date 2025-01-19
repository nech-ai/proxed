"use client";

import { ActionBlock } from "@/components/shared/action-block";
import type { Tables } from "@proxed/supabase/types";
import { DeviceChecksList } from "./device-checks-list";

export function DeviceChecksBlock({
  deviceChecks,
}: {
  deviceChecks: Partial<Tables<"device_checks">>[];
}) {
  return (
    <div className="space-y-6">
      <ActionBlock title="Device Check Configurations">
        <DeviceChecksList deviceChecks={deviceChecks} />
      </ActionBlock>
    </div>
  );
}

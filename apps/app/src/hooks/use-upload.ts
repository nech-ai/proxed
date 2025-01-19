import { createClient } from "@proxed/supabase/client";
import { upload } from "@proxed/supabase/storage";
import { useState } from "react";

export function useUpload() {
  const supabase = createClient();
  const [isLoading, setLoading] = useState(false);

  const uploadFile = async ({
    file,
    path,
    bucket,
  }: {
    file: File;
    path: string[];
    bucket: string;
  }) => {
    setLoading(true);

    const url = await upload(supabase, {
      path,
      file,
      bucket,
    });

    setLoading(false);

    return {
      url,
      path,
    };
  };

  return {
    uploadFile,
    isLoading,
  };
}

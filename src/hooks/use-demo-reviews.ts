import { useCallback, useEffect, useState } from "react";

import { getProductApi, type ClaimReview } from "@/product-api";

export function useDemoReviews() {
  const [reviews, setReviews] = useState<ClaimReview[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const next = await getProductApi().listReviews();
    setReviews(next);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const deleteAll = useCallback(async () => {
    await getProductApi().deleteAllReviews();
    await refresh();
  }, [refresh]);

  return { reviews, loaded, refresh, deleteAll };
}

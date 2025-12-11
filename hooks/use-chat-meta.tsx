import { useQuery } from "@tanstack/react-query";

export const useChatMeta = (
  id: string | string[] | undefined,
): { totalPages: number; totalCount: number; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ["conversation", id, "total"],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("cid", String(Number(id)));
      const res = await fetch(`/api/chat/direct/total?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load total pages");
      return (await res.json()) as { totalPages: number; totalCount: number };
    },
    enabled: !!id,
  });

  return {
    totalPages: data?.totalPages ?? 0,
    totalCount: data?.totalCount ?? 0,
    isLoading,
  };
};

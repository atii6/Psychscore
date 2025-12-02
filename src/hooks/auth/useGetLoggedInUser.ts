import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useQuery } from "@tanstack/react-query";
import type { AppUserAttributes } from "@/utilitites/types/User";

interface MeResponse {
  user: AppUserAttributes;
}

async function getMe(): Promise<AppUserAttributes> {
  const res = await fetchWrapper<MeResponse>({
    url: `auth/me`,
    method: "GET",
  });

  return res.user;
}

export default function useGetLoggedInUser() {
  return useQuery<AppUserAttributes>({
    queryKey: ["me"],
    queryFn: getMe,
    // staleTime: 5 * 60 * 1000, // optional caching
  });
}

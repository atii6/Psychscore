import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useQuery } from "@tanstack/react-query";
import type { AppUserAttributes } from "@/utilitites/types/User";

interface MeResponse {
  user: AppUserAttributes;
}

async function getMe(): Promise<AppUserAttributes> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetchWrapper<MeResponse>({
    url: `auth/me`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.user;
}

export default function useGetLoggedInUser() {
  const token = localStorage.getItem("token");
  return useQuery<AppUserAttributes>({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!token,
    // staleTime: 5 * 60 * 1000, // optional caching
  });
}

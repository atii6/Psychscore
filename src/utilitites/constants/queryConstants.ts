const threeMinutesInMilliSeconds = 3 * 60 * 1000;
const twentyMinutesInMilliSeconds = 20 * 60 * 1000;

export const CACHE_AND_STALE_TIME = {
  staleTime: threeMinutesInMilliSeconds,
  cacheTime: twentyMinutesInMilliSeconds,
  refetchOnWindowFocus: false,
};

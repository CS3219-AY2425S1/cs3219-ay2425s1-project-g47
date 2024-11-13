import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import axios from "@/utils/axios";
import { History, HistoryList } from "@/types/history";

const fetchHistoryFromPage = async (username: string, page: number) : Promise<HistoryList> => {
  const { data } = await axios.get(
    `/collaboration-service/get-history?username=${username}&page=${page}&limit=10`,
  );

  return data;
};

// Hook to fetch history
export const useHistory = (username: string, page: number) => {
    return useQuery<HistoryList, AxiosError>({
      queryKey: ["history", page, username],
      queryFn: () => fetchHistoryFromPage(username, page),
      enabled: !!username, // Only fetch if username is available
    });
};

// Fetch a single session
export const useGetHistory= (id: string) => {
  return useQuery<History, AxiosError>({
    queryKey: ["session", id],
    queryFn: async () => {
      const { data } = await axios.get(`/collaboration-service/get-session?roomId=${id}`);

      return data;
    },
    enabled: !!id, // Only fetch if id is available
  });
};
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { UserMatchRequest, UserMatchResponse } from "@/types/match";
import axios from "@/utils/axios";

const addUserToMatchQueue = async (
  userMatchRequest: UserMatchRequest,
): Promise<UserMatchResponse> => {
  const response = await axios.post(
    "matching-service/addUser",
    userMatchRequest,
  );

  return response.data;
};

export const useAddUserToMatch = (
  onSuccess: (data: UserMatchResponse) => void,
) => {
  return useMutation<UserMatchResponse, AxiosError, UserMatchRequest>({
    mutationFn: addUserToMatchQueue,
    onSuccess: onSuccess,
  });
};

const removeUserFromQueue = async (userID: string) => {
  await axios.post(`/matching-service/cancel/${userID}`);
};

export const useCancelUserMatch = (onSuccess: () => void) => {
  return useMutation({
    mutationFn: removeUserFromQueue,
    onSuccess: onSuccess,
  });
};

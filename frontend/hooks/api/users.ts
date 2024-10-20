import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import axios from "@/utils/axios";
import { User, UserProfile } from "@/types/user";

const updateUser = async ({
  user,
  userId,
}: {
  user: UserProfile;
  userId: string;
}): Promise<User> => {
  const response = await axios.patch(`/user-service/users/${userId}`, user);

  return response.data.data;
};

export const useUpdateUser = () => {
  return useMutation<User, AxiosError, { user: UserProfile; userId: string }>({
    mutationFn: updateUser,
    onSuccess: () => {
      // handle success
    },
  });
};

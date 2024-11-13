import { useState } from "react";
import { Divider } from "@nextui-org/divider";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";

import {
  EmailIcon,
  PersonCardIcon,
  KeyIcon,
  EyeFilledIcon,
  EyeSlashFilledIcon,
} from "@/components/icons";
import { UserProfile } from "@/types/user";

interface UserProfileFormProps {
  formData: UserProfile;
  setFormData: (formData: UserProfile) => void;
  onSubmit: (data: UserProfile) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  formData,
  setFormData,
  onSubmit,
}) => {
  const [isNewPasswordVisible, setIsNewPasswordVisible] =
    useState<boolean>(false);
  const [isCheckNewPasswordVisible, setIsCheckNewPasswordVisible] =
    useState<boolean>(false);

  const [newPassword, setNewPassword] = useState<string>("");
  const [checkNewPassword, setCheckNewPassword] = useState<string>("");
  const [passwordMismatch, setPasswordMismatch] = useState<string>("");
  const [usernameEmpty, setUsernameEmpty] = useState<string>("");
  const [emailEmpty, setEmailEmpty] = useState<string>("");

  const toggleNewPasswordVisibility = () =>
    setIsNewPasswordVisible(!isNewPasswordVisible);

  const toggleCheckNewPasswordVisibility = () =>
    setIsCheckNewPasswordVisible(!isCheckNewPasswordVisible);

  const handleUsernameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      username: e.target.value,
    });
  };

  const handleEmailOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      email: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (newPassword || checkNewPassword) {
      if (newPassword !== checkNewPassword) {
        setPasswordMismatch("Passwords do not match!");

        return;
      }
    }

    if (!!!formData.username) {
      setUsernameEmpty("Username cannot be empty!");

      return;
    }

    if (!!!formData.email) {
      setEmailEmpty("Email cannot be empty!");

      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="flex flex-col flex-[1] pl-5 pr-5 pt-2">
      <div className="flex justify-between">
        <p className="font-mono text-2xl font-bold py-5">Edit Profile</p>
        <div className="content-center w-48 px-5">
          <Button
            color="primary"
            fullWidth={true}
            variant="solid"
            onClick={handleSubmit}
          >
            Update Settings
          </Button>
        </div>
      </div>
      <Divider />
      <Input
        className="max-w-xs pt-5"
        errorMessage={usernameEmpty}
        isInvalid={!!usernameEmpty}
        label="Username"
        labelPlacement="outside"
        placeholder="Enter your username"
        radius="full"
        startContent={<PersonCardIcon />}
        value={formData.username}
        variant="bordered"
        onChange={handleUsernameOnChange}
      />
      <Input
        className="max-w-xs pt-5"
        errorMessage={emailEmpty}
        isInvalid={!!emailEmpty}
        label="Email Address"
        labelPlacement="outside"
        placeholder="Enter your email"
        radius="full"
        startContent={<EmailIcon />}
        type="email"
        value={formData.email}
        variant="bordered"
        onChange={handleEmailOnChange}
      />
      <div className="flex justify-between pt-5">
        <p className="font-mono text-2xl font-bold py-5">Change Password</p>
      </div>
      <Divider />
      <Input
        className="max-w-xs pt-5"
        endContent={
          <button
            aria-label="toggle password visibility"
            className="focus:outline-none"
            type="button"
            onClick={toggleCheckNewPasswordVisibility}
          >
            {isCheckNewPasswordVisible ? (
              <EyeSlashFilledIcon />
            ) : (
              <EyeFilledIcon />
            )}
          </button>
        }
        errorMessage={passwordMismatch}
        isInvalid={!!passwordMismatch}
        label="New Password"
        labelPlacement="outside"
        placeholder="Enter a new password"
        radius="full"
        startContent={<KeyIcon />}
        type={isCheckNewPasswordVisible ? "text" : "password"}
        variant="bordered"
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Input
        className="max-w-xs pt-5"
        endContent={
          <button
            aria-label="toggle password visibility"
            className="focus:outline-none"
            type="button"
            onClick={toggleNewPasswordVisibility}
          >
            {isNewPasswordVisible ? <EyeSlashFilledIcon /> : <EyeFilledIcon />}
          </button>
        }
        errorMessage={passwordMismatch}
        isInvalid={!!passwordMismatch}
        label="Re-enter New Password"
        labelPlacement="outside"
        placeholder="Enter your new password again"
        radius="full"
        startContent={<KeyIcon />}
        type={isNewPasswordVisible ? "text" : "password"}
        variant="bordered"
        onChange={(e) => setCheckNewPassword(e.target.value)}
      />
    </div>
  );
};

export default UserProfileForm;

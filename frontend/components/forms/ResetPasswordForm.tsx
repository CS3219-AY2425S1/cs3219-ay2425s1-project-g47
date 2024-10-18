import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

interface ResetPasswordFormProps {
  onSubmit: (newPassword: string, confirmPassword: string) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isValid = () => {
    const newErrors: { [key: string]: boolean } = {};

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = true;
    }

    // Validate confirm password and check if it matches new password
    if (!formData.confirmPassword || formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = true;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid()) {
      onSubmit(formData.newPassword, formData.confirmPassword);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">

      <div className="mb-4">
        <label htmlFor="newPassword" className="block text-gray-400">
          New Password
        </label>
        <Input
          required
          id="newPassword"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleInputChange}
        />
        {errors.newPassword && (
          <span className="text-red-500">Please provide a new password</span>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-gray-400">
          Confirm Password
        </label>
        <Input
          required
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
        {errors.confirmPassword && (
          <span className="text-red-500">Passwords do not match</span>
        )}
      </div>

      <Button
        className="w-full py-2 bg-blue-600 text-white rounded-lg"
        type="submit"
      >
        Reset Password
      </Button>
    </form>
  );
};

export default ResetPasswordForm;

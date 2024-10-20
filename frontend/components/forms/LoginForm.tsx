import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // Reset email error when user starts typing
  const handleEmailOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      email: e.target.value,
    });

    // Reset the email error if user starts typing after form submission
    setErrors((prevErrors) => ({
      ...prevErrors,
      email: false,
    }));
  };

  // Reset password error when user starts typing
  const handlePasswordOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      password: e.target.value,
    });

    // Reset the password error if user starts typing after form submission
    setErrors((prevErrors) => ({
      ...prevErrors,
      password: false,
    }));
  };

  const isValid = () => {
    const newErrors: { [key: string]: boolean } = {};

    if (!formData.email) {
      newErrors.email = true;
    }

    if (!formData.password) {
      newErrors.password = true;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid()) {
      onSubmit(formData.email, formData.password);
    }
  };

  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-center">Login</h2>
      </div>

      <div className="mb-4">
        <label className="block text-gray-400" htmlFor="email">
          Email
        </label>
        <Input 
          errorMessage="Please provide a valid email." 
          isInvalid={!!errors.email} 
          isRequired={true} 
          type="email" 
          value={formData.email} 
          onChange={handleEmailOnChange} 
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-400" htmlFor="password">
          Password
        </label>
        <Input 
          errorMessage="Password is required." 
          isInvalid={!!errors.password}
          isRequired={true} 
          type="password" 
          value={formData.password} 
          onChange={handlePasswordOnChange} 
        />
      </div>

      <Button
        className="w-full py-2 bg-blue-600 text-white rounded-lg"
        type="submit"
      >
        Login
      </Button>
    </form>
  );
};

export default LoginForm;

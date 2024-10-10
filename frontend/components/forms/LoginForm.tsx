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

  const handleEmailOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      email: e.target.value,
    });
  };

  const handlePasswordOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      password: e.target.value,
    });
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
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-center text-white">
          Login
        </h2>
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-400">
          Email
        </label>
        <Input
          required
          id="email"
          type="email"
          value={formData.email}
          onChange={handleEmailOnChange}
        />
        {errors.email && (
          <span className="text-red-500">Please provide a valid email</span>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-400">
          Password
        </label>
        <Input
          required
          id="password"
          type="password"
          value={formData.password}
          onChange={handlePasswordOnChange}
        />
        {errors.password && (
          <span className="text-red-500">Password is required</span>
        )}
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

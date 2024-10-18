import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

interface ForgetPasswordFormProps {
  onSubmit: (email: string) => void;
}

const ForgetPasswordForm: React.FC<ForgetPasswordFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

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

  const isValid = () => {
    const newErrors: { [key: string]: boolean } = {};

    if (!formData.email) {
      newErrors.email = true;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid()) {
      onSubmit(formData.email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-center">Enter your registered email</h2>
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-400">
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

      <Button
        className="w-full py-2 bg-blue-600 text-white rounded-lg"
        type="submit"
      >
        Send Reset Email
      </Button>

    </form>
  );
};

export default ForgetPasswordForm;

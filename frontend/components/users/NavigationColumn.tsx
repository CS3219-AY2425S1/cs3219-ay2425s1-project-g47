import { useState } from "react";
import { Button } from "@nextui-org/button";

import { UserIcon } from "@/components/icons";

const rows = [
  { key: "profile", label: "Profile Settings", icon: <UserIcon /> },
];

const NavigationColumn = () => {
  const [activeButton, setActiveButton] = useState<string>("profile");

  return (
    <div className="flex-col">
      <p className="font-mono text-2xl font-bold flex justify-between pl-5 py-5">
        User profile management
      </p>
      <ul>
        {rows.map((item) => (
          <li key={item.key} className="flex justify-between pl-5 pr-5">
            <Button
              className="justify-start"
              disableAnimation={true}
              fullWidth={true}
              radius="sm"
              size="md"
              startContent={item.icon}
              variant={activeButton === item.key ? "solid" : "light"}
              onClick={() => setActiveButton(item.key)}
            >
              {item.label}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationColumn;

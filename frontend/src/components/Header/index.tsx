import React from "react";
import { useGetAuthUserQuery } from "@/state/api";

type Props = {
  name: string;
  buttonComponent?: any;
  isSmallText?: boolean;
};

const Header = ({ name, buttonComponent, isSmallText = false }: Props) => {
  const { data: authUser } = useGetAuthUserQuery();
  const userRole = (authUser?.userRole as String ).toLowerCase();

  return (
    <div className="mb-5 flex w-full items-center justify-between">
      <h1 className={`${isSmallText ? "text-lg" : "text-2xl"} font-semibold dark:text-white`}>
        {name}
      </h1>
      {userRole === "manager" && buttonComponent}
    </div>
  );
};

export default Header;

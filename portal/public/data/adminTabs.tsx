import { IconBellRinging, IconCreditCard, IconCreditCardOff, IconCricket, IconHelp, IconHistory, IconLogout, IconSettings, IconUser, IconUserEdit, IconWallet } from "@tabler/icons-react";
import React from "react";

export const dashboardTabs = [
  {
    id: 1,
    tabname: "User Management",
    icon: <IconUserEdit className="ti ti-wallet fs-five n5-color" />,
  },
  {
    id: 2,
    tabname: "Deposit",
    icon: <IconCreditCard className="ti ti-credit-card fs-five n5-color" />,
  },
  {
    id: 3,
    tabname: "Withdrawal",
    icon: <IconCreditCard
      className="ti ti-credit-card-off fs-five n5-color" />,
  },
  {
    id: 4,
    tabname: "History",
    icon: <IconHistory
      className="ti ti-history fs-five n5-color" />,
  },
  {
    id: 5,
    tabname: "Matches",
    icon: <IconCricket
      className="ti ti-user fs-five n5-color" />,
  },
  {
    id: 6,
    tabname: "Complaints",
    icon: <IconHelp
      className="ti ti-user fs-five n5-color" />,
  },
  // {
  //   id: 6,
  //   tabname: "Logout",
  //   icon: <IconLogout
  //     className="ti ti-settings fs-five n5-color" />,
  // },

];
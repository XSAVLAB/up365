import { IconBellRinging, IconCreditCard, IconCreditCardOff, IconHistory, IconLogout, IconMoneybag, IconReportMoney, IconSettings, IconUser, IconWallet } from "@tabler/icons-react";
import { TbProgressHelp } from "react-icons/tb";
import { FaHandsHelping } from "react-icons/fa";
import React from "react";

export const dashboardTabs = [
  {
    id: 1,
    tabname: "Deposit",
    icon: <IconWallet className="ti ti-wallet fs-five n5-color" />,

  },
  {
    id: 2,
    tabname: "Withdrawal",
    icon: <IconCreditCard className="ti ti-credit-card fs-five n5-color" />,
  },
  {
    id: 3,
    tabname: "Balance History",
    icon: <IconHistory
      className="ti ti-history fs-five n5-color" />,
  },
  {
    id: 4,
    tabname: "Statement",
    icon: <IconMoneybag
      className="ti ti-bell-ringing fs-five n5-color" />,
  },
  {
    id: 5,
    tabname: "Bets",
    icon: <IconReportMoney
      className="ti ti-bell-ringing fs-five n5-color" />,
  },
  {
    id: 6,
    tabname: "Complaints History",
    icon: <FaHandsHelping
      className="ti ti-bell-ringing fs-five n5-color"
    />
  },
  {
    id: 7,
    tabname: "Settings",
    icon: <IconSettings
      className="ti ti-settings fs-five n5-color" />,
  },
  {
    id: 8,
    tabname: "Profile",
    icon: <IconUser
      className="ti ti-user fs-five n5-color" />,

  },
  {
    id: 9,
    tabname: "Help",
    icon: <TbProgressHelp
      className="ti ti-bell-ringing fs-five n5-color"
    />
  },
  {
    id: 10,
    tabname: "Log out",
    icon: <IconLogout
      className="ti ti-logout fs-five n5-color" />,
  },
];
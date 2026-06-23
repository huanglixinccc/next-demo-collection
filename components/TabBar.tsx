"use client";

import { TabConfig } from "@/lib/types";

interface TabBarProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-blue-600 text-white"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

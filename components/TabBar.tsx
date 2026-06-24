/**
 * Tab 标签切换栏组件
 * 渲染 Tab 列表，高亮当前激活项，点击触发切换回调
 */
"use client";

import { TabConfig } from "@/lib/types";

interface TabBarProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/** @param tabs - Tab 配置列表
 *  @param activeTab - 当前激活的 Tab ID
 *  @param onTabChange - Tab 切换回调 */
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

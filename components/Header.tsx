/**
 * 顶部导航栏组件
 * 包含 Logo、Tab 切换栏和主题切换按钮，固定在页面顶部
 */
"use client";

import { useState } from "react";
import { TabConfig } from "@/lib/types";
import { TabBar } from "./TabBar";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  tabs: TabConfig[];
}

/** 管理当前激活的 Tab 状态 */
export function Header({ tabs }: HeaderProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Nest
          </h1>
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

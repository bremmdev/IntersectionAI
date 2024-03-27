import React from "react";
import { cn } from "@/lib/utils";

interface TabsProps extends React.ComponentPropsWithRef<"div"> {
  /**
   * The label of the default selected tab, only use this if the component is uncontrolled
   * @default ''
   */
  defaultValue?: string;
  /**
   * The label of the active tab, use this if the component is controlled
   */
  value?: string;
  /**
   * Callback when the active tab changes
   */
  onValueChange?: (value: string) => void;
  children: Array<React.ReactElement>;
}

export interface TabListProps extends React.ComponentPropsWithRef<"div"> {
  children: Array<React.ReactElement<TabProps>>;
}

export interface TabProps extends React.ComponentPropsWithRef<"button"> {
  /**
   * The label for the tab, used to associate the tab with its content panel
   */
  label: string;
}

export interface TabContentProps extends React.ComponentPropsWithRef<"div"> {
  /**
   * The label for the tab, used to associate the content panel with its tab
   */
  label: string;
}

type TabsContext = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onValueChange?: (value: string) => void;
};

const TabsContext = React.createContext<TabsContext | undefined>(undefined);

export const Tabs = ({
  className,
  defaultValue = "",
  value = "",
  onValueChange,
  children,
}: TabsProps) => {
  if (value && defaultValue) {
    throw new Error(
      "Using both value and defaultValue is not recommended. Use value and onValueChange for controlled component, or defaultValue for uncontrolled component."
    );
  }

  const tabsRef = React.useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = React.useState(value || defaultValue);

  //Update the active tab when the value prop changes in a controlled component
  React.useEffect(() => {
    if (value && value !== activeTab && !defaultValue) {
      setActiveTab(value);
    }
  }, [value, activeTab, defaultValue]);

  //Set the first tab as active if there are no tabs with the active state
  React.useEffect(() => {
    if (value === "" && defaultValue === "" && activeTab === "") {
      const tabs = tabsRef.current?.querySelectorAll('button[role="tab"]');
      if (tabs && tabs.length > 0) {
        const firstTab = tabs[0] as HTMLButtonElement;
        setActiveTab(firstTab.dataset.tablabel!);
      }
    }
  }, [tabsRef, activeTab, value, defaultValue]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, onValueChange }}>
      <div className={cn("text-slate-950", className)} ref={tabsRef}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.Root = Tabs;

const TabList = ({ className, children, ...props }: TabListProps) => {
  const { activeTab, setActiveTab, onValueChange } = React.useContext(
    TabsContext
  ) as TabsContext;

  const tabListRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;

    function getTabs() {
      return Array.from(
        tabListRef.current!.children
      ) as Array<HTMLButtonElement>;
    }

    if (key === "ArrowRight" || key === "ArrowLeft") {
      e.preventDefault();
      const tabs = getTabs();

      //get the current index of the active tab based on its data-label
      const currentIndex = tabs.findIndex(
        (tab) => tab.dataset.tablabel === activeTab
      );
      //get the next index based on the arrow key pressed, and make sure it loops
      const direction = key === "ArrowRight" ? 1 : -1;
      const nextTab =
        tabs[(currentIndex + direction + tabs.length) % tabs.length];
      setActiveTab(nextTab.dataset.tablabel!);
      nextTab.focus();
      if (onValueChange) {
        onValueChange(nextTab.dataset.tablabel!);
      }
    }

    if (key === "Home" || key === "End") {
      e.preventDefault();
      const tabs = getTabs();
      const indexToFocus = key === "Home" ? 0 : tabs.length - 1;
      const newTab = tabs[indexToFocus];
      setActiveTab(newTab.dataset.tablabel!);
      newTab.focus();
      if (onValueChange && newTab.dataset.tablabel !== activeTab) {
        onValueChange(newTab.dataset.tablabel!);
      }
    }
  };

  return (
    <div
      role="tablist"
      {...props}
      onKeyDown={handleKeyDown}
      className={cn("border-b border-b-slate-300 mb-1", className)}
      ref={tabListRef}
    >
      {children}
    </div>
  );
};

Tabs.List = TabList;

const Tab = ({ className, label, children }: TabProps) => {
  const { activeTab, setActiveTab, onValueChange } = React.useContext(
    TabsContext
  ) as TabsContext;

  const tabRef = React.useRef<HTMLButtonElement>(null);

  const handleOnClick = () => {
    if (activeTab === label) return;
    setActiveTab(label);
    if (onValueChange) {
      onValueChange(label);
    }
  };

  return (
    <button
      role="tab"
      type="button"
      id={`tab-${label}`}
      aria-controls={`panel-${label}`}
      aria-selected={activeTab === label}
      tabIndex={activeTab === label ? 0 : -1}
      onClick={handleOnClick}
      data-tablabel={label}
      ref={tabRef}
      className={cn(
        "p-2 lg:px-4 mb-[2px] focus-visible:outline-primary-blue focus-visible:-outline-offset-1 hover:bg-blue-50 mr-1",
        {
          "border-b-2 border-b-primary-blue font-medium bg-blue-50":
            activeTab === label,
        },
        className
      )}
    >
      {children}
    </button>
  );
};

Tabs.Tab = Tab;

const TabContent = ({
  className,
  label,
  children,
  ...props
}: TabContentProps) => {
  const { activeTab } = React.useContext(TabsContext) as TabsContext;

  return (
    <div
      role="tabpanel"
      id={`panel-${label}`}
      aria-labelledby={`tab-${label}`}
      tabIndex={0}
      className={cn(
        "animate-fade-in p-4 focus-visible:outline-primary-blue",
        className,
        {
          hidden: activeTab !== label,
        }
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Tabs.Content = TabContent;
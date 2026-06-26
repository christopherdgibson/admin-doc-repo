import { Button } from "@wordpress/components";

import type { Dispatch, SetStateAction } from "react";

interface TabButtonProps {
    tabName: string;
    tabText: string;
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
}

export default function TabButton({ tabName, tabText, activeTab, setActiveTab }: TabButtonProps) {
    return (
        <Button
            variant={activeTab === tabName ? "primary" : "secondary"}
            onClick={() => setActiveTab(tabName)}
            >
            {tabText}
        </Button>
    );
}
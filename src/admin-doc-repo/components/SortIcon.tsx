import type { SortKey } from "@block-root/types";

interface SortIconProps {
	col: SortKey;
	sortBy: SortKey;
	sortAsc: boolean;
}

export default function SortIcon({ col, sortBy, sortAsc }: SortIconProps) {
	if (sortBy !== col) {
		return <span style={{ color: "#ccc", marginLeft: 4 }}>↕</span>;
	}

	return <span style={{ marginLeft: 4 }}>{sortAsc === true ? "↑" : "↓"}</span>;
}

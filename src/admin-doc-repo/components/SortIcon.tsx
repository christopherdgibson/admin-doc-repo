import type { SfmFile } from "@block-root/types";

interface SortIconProps {
	col: string;
	sortBy: keyof SfmFile;
	sortAsc: boolean;
}

export default function SortIcon({ col, sortBy, sortAsc }: SortIconProps) {
	if (sortBy !== col) {
		return <span style={{ color: "#ccc", marginLeft: 4 }}>↕</span>;
	}

	return <span style={{ marginLeft: 4 }}>{sortAsc === true ? "↑" : "↓"}</span>;
}

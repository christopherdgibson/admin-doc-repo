import type { ApiProps, SfmFile, UploadResponse } from "@block-root/types";

interface SortIconProps {
	col: string;
	sortBy: keyof SfmFile;
	sortDir: string;
}

export default function SortIcon({ col, sortBy, sortDir }: SortIconProps) {
	if (sortBy !== col) {
		return <span style={{ color: "#ccc", marginLeft: 4 }}>↕</span>;
	}

	return <span style={{ marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
}

import * as React from "npm:react@18.3.1";

export function Logo({
	withLabel = true,
}: {
	withLabel?: boolean;
}) {
	return (
		<>
			<span className="flex items-center font-semibold text-primary leading-none">
				<img
					src="https://proxed.ai/icon.png"
					width="48"
					height="48"
					alt="Proxed.AI"
				/>
				{withLabel && <span className="ml-3 text-xl">proxed.ai</span>}
			</span>
		</>
	);
}

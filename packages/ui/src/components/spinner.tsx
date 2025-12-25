const bars = Array(12).fill(0);

export const Spinner = ({ size = 16 }) => {
	return (
		<div className="loading-parent">
			<div
				className="loading-wrapper"
				data-visible
				// @ts-expect-error CSS custom property typing for inline style
				style={{ "--spinner-size": `${size}px` }}
			>
				<div className="spinner">
					{bars.map((_, i) => (
						<div className="loading-bar" key={`spinner-bar-${i.toString()}`} />
					))}
				</div>
			</div>
		</div>
	);
};

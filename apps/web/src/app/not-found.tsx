import Link from "next/link";

export default function NotFound() {
	return (
		<div className="fixed bg-[#0C0C0C] top-0 right-0 bottom-0 left-0 z-30 flex flex-col items-center">
			<h1 className="font-mono md:text-[300px] text-[140px] font-medium text-center mt-20">
				404
			</h1>
			<Link
				href="/"
				className="mt-8 inline-flex items-center justify-center border border-gray-800 bg-black/50 px-6 py-3 text-sm font-medium text-gray-300 backdrop-blur hover:bg-gray-900 hover:text-white transition-colors"
			>
				Back Home
			</Link>
		</div>
	);
}

import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
	title: "Cookie Policy | Proxed.AI",
	description: "Cookie Policy for Proxed.AI",
	path: "/legal/cookies",
	noIndex: true,
});

export default function CookiesPage() {
	return (
		<>
			<h1>Cookie Policy</h1>
			<p className="text-gray-400">Effective Date: December 18, 2024</p>

			<div className="mb-8">
				<p>
					Comonad Limited (Company Number: 15713725) ("we", "us", "our") uses
					cookies and similar technologies on the proxed.ai website (the
					"Website") to improve user experience, analyse traffic, and provide
					relevant content. This Cookie Policy explains what cookies are, how
					and why we use them, and how you can manage your preferences.
				</p>
			</div>

			<h2>1. What Are Cookies?</h2>
			<p>
				Cookies are small text files placed on your device (e.g., computer,
				smartphone, tablet) when you visit a website. They help the site
				recognise your device and store certain information about your
				preferences and interactions.
			</p>

			<h2>2. Types of Cookies We Use</h2>
			<p>We may use the following categories of cookies:</p>
			<ul>
				<li>
					<strong>Strictly Necessary Cookies:</strong> These are essential for
					the Website to function properly. Without these cookies, some parts of
					the Website may not work as intended.
				</li>
				<li>
					<strong>Performance & Analytics Cookies:</strong> These cookies
					collect information about how visitors use the Website, such as which
					pages are visited most often. We use this information to improve the
					Website's performance and user experience.
				</li>
				<li>
					<strong>Functionality Cookies:</strong> These enable the Website to
					remember choices you make (e.g., your preferred language) and provide
					enhanced, more personalised features.
				</li>
			</ul>

			<h2>3. Third-Party Cookies</h2>
			<p>
				We may allow third-party service providers to place cookies on your
				device for the purposes described above. These third parties are
				responsible for the cookies they set on our site and will have their own
				privacy and cookie policies, which we encourage you to read.
			</p>

			<h2>4. Managing Your Cookie Preferences</h2>
			<p>You can adjust your cookie preferences at any time by:</p>
			<ul>
				<li>
					<strong>Browser Settings:</strong> Most web browsers allow you to
					block or delete cookies. Please refer to your browser's help section
					for instructions on how to manage cookies.
				</li>
				<li>
					<strong>Third-Party Opt-Outs:</strong> For performance, analytics, or
					advertising cookies set by third parties, you may opt out by following
					the instructions provided in their respective privacy or cookie
					policies.
				</li>
			</ul>
			<p>
				Note that disabling some categories of cookies may impact the
				functionality or performance of the Website.
			</p>

			<h2>5. Changes to This Cookie Policy</h2>
			<p>
				We may update this Cookie Policy from time to time. Any changes will be
				posted on this page, and the "Effective Date" will be updated
				accordingly. By continuing to use the Website after these changes are
				posted, you acknowledge and agree to the updated policy.
			</p>

			<div className="mt-8 border-t border-gray-800 pt-8">
				<h2>Contact Us</h2>
				<p>
					If you have any questions or concerns about this Cookie Policy or our
					use of cookies, please contact us at:{" "}
					<a
						href="mailto:privacy@proxed.ai"
						className="text-purple-400 hover:text-purple-300"
					>
						privacy@proxed.ai
					</a>
				</p>

				<p className="mt-8 text-gray-400">
					By using the Website, you acknowledge that you have read, understood,
					and agree to the use of cookies as described in this Cookie Policy.
				</p>
			</div>
		</>
	);
}

import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
	title: "Privacy Policy | Proxed.AI",
	description: "Privacy Policy for Proxed.AI",
	path: "/legal/privacy",
	noIndex: true,
});

export default function PrivacyPage() {
	return (
		<>
			<h1>Privacy Policy</h1>
			<p className="text-gray-400">Effective Date: December 18, 2024</p>

			<div className="mb-8">
				<p>
					Comonad Limited (Company Number: 15713725) ("we", "us", "our")
					respects your privacy and is committed to protecting the personal data
					we process when you join the Proxed.ai (the "Proxed.ai"). This Privacy
					Policy explains how we collect, use, store, and protect your personal
					data, as well as your rights regarding that data.
				</p>
			</div>

			<h2>1. Data We Collect</h2>
			<p>
				When you sign up for the Proxed.ai, we may collect the following
				personal data:
			</p>
			<ul>
				<li>
					Contact Information: Such as your name, email address, and company
					name.
				</li>
				<li>
					Optional Data: Any additional information you choose to provide (e.g.,
					job title, industry).
				</li>
			</ul>

			<h2>2. How We Use Your Data</h2>
			<p>We use the personal data we collect for the following purposes:</p>
			<ul>
				<li>
					<strong>Product Improvement:</strong> To understand interest in our
					product and to improve features, functionalities, and user experience
					based on aggregated and anonymised feedback.
				</li>
				<li>
					<strong>Marketing & Communication:</strong> To send you relevant
					information about Proxed.ai, including promotional materials or
					newsletters, where you have provided consent or where otherwise
					permitted by law.
				</li>
			</ul>

			<h2>3. Legal Basis for Processing</h2>
			<p>We process your personal data on the basis of:</p>
			<ul>
				<li>
					<strong>Consent:</strong> When you provide your information to join
					the Proxed.ai, you consent to our collection and processing of your
					personal data for the purposes described.
				</li>
				<li>
					<strong>Legitimate Interests:</strong> We may process your data for
					our legitimate interests, such as improving the product and
					communicating updates, provided these interests are not overridden by
					your data protection rights.
				</li>
			</ul>

			<h2>4. Data Sharing & Disclosure</h2>
			<p>We may share your personal data with:</p>
			<ul>
				<li>
					<strong>Service Providers:</strong> Trusted third parties who assist
					us in operating our website, running the Proxed.ai, or providing
					related services, under strict confidentiality and data protection
					obligations.
				</li>
				<li>
					<strong>Legal or Regulatory Authorities:</strong> Where required by
					law, or to protect our rights, safety, or property.
				</li>
			</ul>
			<p>We do not sell or rent your personal data to third parties.</p>

			<h2>5. International Transfers</h2>
			<p>
				If we transfer your personal data outside of the United Kingdom or the
				European Economic Area, we will ensure appropriate safeguards are in
				place, such as Standard Contractual Clauses or an adequacy decision, to
				protect your personal data in accordance with applicable laws.
			</p>

			<h2>6. Data Retention</h2>
			<p>
				We keep your personal data for as long as necessary to fulfil the
				purposes described in this Privacy Policy, or as required by law. If you
				request removal from the Proxed.ai, we will delete or anonymise your
				data as soon as practicable, unless legal obligations require us to
				retain it.
			</p>

			<h2>7. Your Rights</h2>
			<p>
				Subject to applicable data protection laws, you have the following
				rights:
			</p>
			<ul>
				<li>Access: Request a copy of the personal data we hold about you.</li>
				<li>
					Rectification: Ask us to correct any inaccurate or incomplete data.
				</li>
				<li>
					Erasure: Request the deletion of your personal data under certain
					circumstances.
				</li>
				<li>
					Restriction: Ask us to restrict the processing of your data in certain
					situations.
				</li>
				<li>
					Objection: Object to our processing of your data based on legitimate
					interests.
				</li>
				<li>
					Data Portability: Request a copy of your personal data in a
					structured, commonly used, and machine-readable format.
				</li>
				<li>
					Withdraw Consent: Where we rely on consent, you may withdraw it at any
					time without affecting the lawfulness of processing carried out before
					withdrawal.
				</li>
			</ul>

			<h2>8. Security Measures</h2>
			<p>
				We implement appropriate technical and organisational measures to
				safeguard your personal data against unauthorised access, loss,
				destruction, or alteration. These measures are regularly reviewed and
				updated as necessary.
			</p>

			<h2>9. Children's Privacy</h2>
			<p>
				The Proxed.ai is not intended for individuals under the age of 18. We do
				not knowingly collect personal data from children. If you believe we
				have collected such data, please contact us so we can remove it.
			</p>

			<h2>10. Changes to This Privacy Policy</h2>
			<p>
				We may update this Privacy Policy from time to time. Changes will be
				posted on our website, and the "Effective Date" will be updated
				accordingly. By continuing to remain on the Proxed.ai after changes are
				made, you acknowledge and agree to the updated Policy.
			</p>

			<div className="mt-8 border-t border-gray-800 pt-8">
				<h2>Contact Us</h2>
				<p>
					If you have any questions, concerns, or wish to exercise your data
					protection rights, please contact us at:{" "}
					<a
						href="mailto:privacy@proxed.ai"
						className="text-purple-400 hover:text-purple-300"
					>
						privacy@proxed.ai
					</a>
				</p>
				<p className="mt-4">
					If you are not satisfied with our response, you may have the right to
					lodge a complaint with your local data protection authority (such as
					the Information Commissioner's Office in the UK).
				</p>

				<p className="mt-8 text-gray-400">
					By joining the Proxed.ai, you acknowledge that you have read,
					understood, and agree to the processing of your personal data as
					described in this Privacy Policy.
				</p>
			</div>
		</>
	);
}

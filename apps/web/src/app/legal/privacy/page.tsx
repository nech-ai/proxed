import { Section } from "@/components/section";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
	title: "Privacy Policy | proxed.ai",
	description: "Privacy Policy for the proxed.ai Service",
	path: "/legal/privacy",
	noIndex: true,
});

export default function PrivacyPage() {
	return (
		<div className="flex justify-center py-12">
			<Section id="privacy">
				<div className="border p-8 backdrop-blur">
					<h1>Privacy Policy</h1>
					<p className="text-gray-400">Effective Date: May 2, 2025</p>

					<div className="mb-8">
						<p>
							Comonad Limited (Company Number: 15713725) ("we", "us", "our")
							respects your privacy and is committed to protecting the personal
							data we process when you use the proxed.ai service (the
							"Service"). This Privacy Policy explains how we collect, use,
							store, and protect your personal data, as well as your rights
							regarding that data.
						</p>
					</div>

					<h2>1. Data We Collect</h2>
					<p>
						When you use the Service, we may collect the following personal
						data:
					</p>
					<ul>
						<li>
							<strong>Account Information:</strong> Such as your name, email
							address, company name (if applicable), and payment information
							(processed by our third-party payment processor).
						</li>
						<li>
							<strong>Usage Data:</strong> Information about how you interact
							with the Service, including IP addresses, browser type, device
							information, pages visited, features used, and API request
							metadata (like timestamps, status codes, endpoint paths, partial
							keys for identification/rate-limiting, but not full
							request/response bodies or full sensitive credentials passed
							through the proxy).
						</li>
						<li>
							<strong>Configuration Data:</strong> Information you provide to
							configure the Service, such as target API endpoints and security
							settings. Note that we do not store full API keys or sensitive
							credentials required for your target APIs in a retrievable format;
							you are responsible for managing these securely.
						</li>
						<li>
							<strong>Communication Data:</strong> Information you provide when
							you contact us for support or other inquiries.
						</li>
					</ul>

					<h2>2. How We Use Your Data</h2>
					<p>We use the personal data we collect for the following purposes:</p>
					<ul>
						<li>
							<strong>Providing and Maintaining the Service:</strong> To
							operate, secure, and improve the Service, process transactions,
							authenticate users, and provide customer support.
						</li>
						<li>
							<strong>Product Improvement:</strong> To analyse usage patterns,
							understand user needs, troubleshoot issues, and enhance the
							features, functionalities, and user experience of the Service.
						</li>
						<li>
							<strong>Communication:</strong> To send you administrative
							information, service announcements, security alerts, and support
							messages. We may also send marketing communications if you opt-in
							or where permitted by law.
						</li>
						<li>
							<strong>Compliance and Protection:</strong> To comply with legal
							obligations, enforce our Terms & Conditions, and protect the
							rights, safety, and property of Proxed.ai, our users, and others.
						</li>
					</ul>

					<h2>3. Legal Basis for Processing</h2>
					<p>We process your personal data on the basis of:</p>
					<ul>
						<li>
							<strong>Contractual Necessity:</strong> To fulfil our contract
							with you to provide the Service.
						</li>
						<li>
							<strong>Legitimate Interests:</strong> For our legitimate
							interests, such as improving the Service, ensuring security,
							preventing fraud, and communicating with users, provided these
							interests are not overridden by your data protection rights.
						</li>
						<li>
							<strong>Consent:</strong> Where required by law, such as for
							certain marketing communications or the use of non-essential
							cookies.
						</li>
						<li>
							<strong>Legal Obligation:</strong> To comply with applicable laws
							and regulations.
						</li>
					</ul>

					<h2>4. Data Sharing & Disclosure</h2>
					<p>We may share your personal data with:</p>
					<ul>
						<li>
							<strong>Service Providers:</strong> Trusted third parties who
							assist us in operating the Service (e.g., cloud hosting providers,
							payment processors, analytics providers, email service providers),
							under strict confidentiality and data protection obligations.
						</li>
						<li>
							<strong>Legal or Regulatory Authorities:</strong> Where required
							by law, legal process, or governmental request, or to protect our
							rights, safety, or property, or that of our users or the public.
						</li>
						<li>
							<strong>Business Transfers:</strong> In connection with a merger,
							acquisition, financing, reorganization, or sale of assets, your
							information may be transferred as part of that transaction,
							subject to standard confidentiality arrangements.
						</li>
					</ul>
					<p>We do not sell or rent your personal data to third parties.</p>

					<h2>5. International Transfers</h2>
					<p>
						Your personal data may be transferred to, and processed in,
						countries other than the country in which you are resident. These
						countries may have data protection laws that are different from the
						laws of your country. Where we transfer your personal data outside
						of the United Kingdom or the European Economic Area, we will ensure
						appropriate safeguards are in place, such as Standard Contractual
						Clauses or reliance on an adequacy decision, to protect your
						personal data in accordance with applicable laws.
					</p>

					<h2>6. Data Retention</h2>
					<p>
						We keep your personal data for as long as necessary to fulfil the
						purposes described in this Privacy Policy, including providing the
						Service, complying with our legal obligations, resolving disputes,
						and enforcing our agreements. Account information is typically
						retained for as long as your account is active and for a reasonable
						period thereafter. Usage data may be retained for shorter periods or
						aggregated and anonymised for analytical purposes.
					</p>

					<h2>7. Your Rights</h2>
					<p>
						Subject to applicable data protection laws, you have the following
						rights regarding your personal data:
					</p>
					<ul>
						<li>
							<strong>Access:</strong> Request a copy of the personal data we
							hold about you.
						</li>
						<li>
							<strong>Rectification:</strong> Ask us to correct any inaccurate
							or incomplete data.
						</li>
						<li>
							<strong>Erasure:</strong> Request the deletion of your personal
							data under certain circumstances.
						</li>
						<li>
							<strong>Restriction:</strong> Ask us to restrict the processing of
							your data in certain situations.
						</li>
						<li>
							<strong>Objection:</strong> Object to our processing of your data
							based on legitimate interests.
						</li>
						<li>
							<strong>Data Portability:</strong> Request a copy of your personal
							data in a structured, commonly used, and machine-readable format.
						</li>
						<li>
							<strong>Withdraw Consent:</strong> Where we rely on consent, you
							may withdraw it at any time without affecting the lawfulness of
							processing carried out before withdrawal.
						</li>
					</ul>
					<p>
						To exercise these rights, please contact us using the details below.
					</p>

					<h2>8. Security Measures</h2>
					<p>
						We implement appropriate technical and organisational measures to
						safeguard your personal data against unauthorised access, loss,
						destruction, or alteration. These measures include encryption,
						access controls, and regular security reviews. However, no method of
						transmission over the Internet or electronic storage is 100% secure.
						Therefore, while we strive to use commercially acceptable means to
						protect your personal data, we cannot guarantee its absolute
						security. You are also responsible for maintaining the security of
						your account credentials, as outlined in our Terms & Conditions. We
						are not responsible for breaches resulting from your failure to
						secure your credentials or for the actions of third parties outside
						our direct control.
					</p>

					<h2>9. Children's Privacy</h2>
					<p>
						The Service is not intended for individuals under the age of 18. We
						do not knowingly collect personal data from children. If you believe
						we have collected such data, please contact us so we can remove it.
					</p>

					<h2>10. Changes to This Privacy Policy</h2>
					<p>
						We may update this Privacy Policy from time to time. Changes will be
						posted on our website or communicated through the Service, and the
						"Effective Date" will be updated accordingly. By continuing to use
						the Service after changes are made, you acknowledge and agree to the
						updated Policy.
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
							If you are not satisfied with our response, you may have the right
							to lodge a complaint with your local data protection authority
							(such as the Information Commissioner's Office in the UK).
						</p>

						<p className="mt-8 text-gray-400">
							By using the Proxed.ai Service, you acknowledge that you have
							read, understood, and agree to the processing of your personal
							data as described in this Privacy Policy.
						</p>
					</div>
				</div>
			</Section>
		</div>
	);
}

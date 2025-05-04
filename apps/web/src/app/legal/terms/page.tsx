import { Section } from "@/components/section";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
	title: "Terms & Conditions | Proxed.ai",
	description: "Terms & Conditions for the Proxed.ai Service",
	path: "/legal/terms",
	noIndex: true,
});

export default function TermsPage() {
	return (
		<div className="flex justify-center py-12">
			<Section id="terms">
				<div className="border p-8 backdrop-blur">
					<h1>Terms & Conditions</h1>
					<p className="text-gray-400">Effective Date: May 2, 2025</p>

					<h2>1. Introduction</h2>
					<p>
						These Terms & Conditions ("Terms") govern your use of the proxed.ai
						service (the "Service") provided by Comonad Limited (Company Number:
						15713725) ("we", "us", "our"). By accessing or using the Service,
						you agree to be bound by these Terms. If you do not agree to these
						Terms, do not use the Service.
					</p>

					<h2>2. Description of Service</h2>
					<p>
						proxed.ai provides an API proxy and related services designed to
						enhance security, performance, and observability for API
						interactions (the "Service"). The specific features and
						functionalities are subject to change.
					</p>

					<h2>3. User Accounts and Responsibilities</h2>
					<p>
						To access certain features of the Service, you may need to create an
						account. You are responsible for maintaining the confidentiality of
						your account credentials (including API keys) and for all activities
						that occur under your account. You agree to notify us immediately of
						any unauthorized use of your account. We do not store full API keys
						or similarly sensitive credentials passed through the proxy in a
						retrievable format. However, you are solely responsible for the
						security of keys and credentials you manage and configure within the
						Service. Leaking or mishandling your keys may lead to unauthorized
						access or data exposure for which we are not liable.
					</p>

					<h2>4. Acceptable Use</h2>
					<p>
						You agree not to use the Service for any unlawful purpose or in any
						way that could harm, disable, overburden, or impair the Service or
						interfere with any other party's use of the Service. Prohibited
						activities include, but are not limited to, transmitting malicious
						code, attempting unauthorized access, and violating any applicable
						laws or regulations.
					</p>

					<h2>5. Changes and Modifications</h2>
					<p>
						We may update, modify, or discontinue any aspect of the Service or
						these Terms at our sole discretion, at any time, and without prior
						notice, although we will endeavour to provide notice of significant
						changes. Such changes will be posted on our website or communicated
						through the Service. By continuing to use the Service after changes
						are made, you agree to be bound by the revised Terms.
					</p>

					<h2>6. Eligibility</h2>
					<p>
						Use of the Service is intended for individuals aged 18 and above,
						and for organisations that are duly authorised to enter into these
						Terms. By using the Service, you represent and warrant that you meet
						these eligibility requirements.
					</p>

					<h2>7. Use of Personal Data</h2>
					<p>
						Our collection and use of personal data in connection with the
						Service are described in our Privacy Policy. By using the Service,
						you consent to our collection and use of data as described therein.
					</p>

					<h2>8. Intellectual Property</h2>
					<p>
						All rights, title, and interest in and to the Service, including but
						not limited to trademarks, logos, designs, code, text, graphics, and
						any other material, remain the property of Comonad Limited and/or
						its licensors. Your use of the Service does not grant you any
						licence, right, or interest in our intellectual property, except for
						the limited right to use the Service according to these Terms.
					</p>

					<h2>9. No Warranty</h2>
					<p>
						The Service is provided on an "as is" and "as available" basis. To
						the fullest extent permissible by law, we disclaim all warranties,
						express or implied, including, without limitation, warranties of
						merchantability, fitness for a particular purpose, title, and
						non-infringement. We do not warrant that the Service will be
						uninterrupted, error-free, or completely secure.
					</p>

					<h2>10. Limitation of Liability</h2>
					<p>
						To the maximum extent permitted by law, Comonad Limited, its
						officers, directors, employees, and affiliates shall not be liable
						for any direct, indirect, incidental, special, consequential, or
						exemplary damages, including but not limited to damages for loss of
						profits, goodwill, use, data, or other intangible losses, arising
						out of or in connection with your use of, or inability to use, the
						Service. This includes, without limitation, damages resulting from:
						(a) unauthorized access to or alteration of your transmissions or
						data; (b) data breaches or leaks originating from your own systems,
						actions (such as credential mishandling), or third-party services
						you integrate with; (c) statements or conduct of any third party on
						the Service; or (d) any other matter relating to the Service. Our
						total liability for any claim arising out of or relating to these
						Terms or the Service is limited to the amount you paid us for the
						Service in the 12 months preceding the claim.
					</p>

					<h2>11. Termination</h2>
					<p>
						We may suspend or terminate your access to the Service at any time,
						for any reason, or for no reason, including for violation of these
						Terms, without liability. You may stop using the Service at any
						time. Provisions that by their nature should survive termination
						(including intellectual property, warranty disclaimers, limitation
						of liability, and governing law) will survive.
					</p>

					<h2>12. Governing Law and Jurisdiction</h2>
					<p>
						These Terms shall be governed by and construed in accordance with
						the laws of England and Wales, without regard to its conflict of law
						principles. Any disputes arising out of or relating to these Terms
						or the Service shall be subject to the exclusive jurisdiction of the
						courts of England and Wales.
					</p>

					<h2>13. Severability</h2>
					<p>
						If any provision of these Terms is deemed unenforceable or invalid
						under applicable law, such provision will be modified to reflect the
						parties' intention or eliminated to the minimum extent necessary, so
						that these Terms shall otherwise remain in full force and effect.
					</p>

					<h2>14. Entire Agreement</h2>
					<p>
						These Terms, together with our Privacy Policy and Cookie Policy,
						constitute the entire agreement between you and Comonad Limited
						concerning the Service, and supersede all prior or contemporaneous
						communications, whether electronic, oral, or written, between you
						and us.
					</p>

					<div className="mt-8 border-t border-gray-800 pt-8">
						<p>
							If you have any questions or concerns about these Terms, please
							contact us at:{" "}
							<a
								href="mailto:legal@proxed.ai"
								className="text-purple-400 hover:text-purple-300"
							>
								legal@proxed.ai
							</a>
						</p>

						<p className="mt-4 text-gray-400">
							By using the proxed.ai Service, you acknowledge that you have
							read, understood, and agree to be bound by these Terms &
							Conditions.
						</p>
					</div>
				</div>
			</Section>
		</div>
	);
}

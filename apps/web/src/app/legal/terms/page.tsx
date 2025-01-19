import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
	title: "Terms & Conditions | Nech",
	description: "Terms & Conditions for the Nech.ai",
	path: "/legal/terms",
	noIndex: true,
});

export default function TermsPage() {
	return (
		<>
			<h1>Terms & Conditions</h1>
			<p className="text-gray-400">Effective Date: December 18, 2024</p>

			<h2>1. Introduction</h2>
			<p>
				These Terms & Conditions ("Terms") govern your participation in the
				Proxed.ai (the "Proxed.ai") organised by Comonad Limited (Company
				Number: 15713725) ("we", "us", "our"). By joining the Proxed.ai, you
				agree to be bound by these Terms.
			</p>

			<h2>2. Nature of the Proxed.ai</h2>
			<p>
				The Proxed.ai provides an opportunity for individuals and organisations
				to register their interest in accessing the beta version of Proxed.ai
				(the "Service"). Joining the Proxed.ai does not guarantee access to the
				beta, nor does it create any obligation on our part to provide access at
				any time.
			</p>

			<h2>3. Changes and Modifications</h2>
			<p>
				We may update, modify, or discontinue any aspect of the Proxed.ai, these
				Terms, or the Service at our sole discretion, at any time, and without
				prior notice. Such changes will be posted on our website. By continuing
				to remain on the Proxed.ai or by accessing the Service after changes are
				made, you agree to be bound by the revised Terms.
			</p>

			<h2>4. Eligibility</h2>
			<p>
				Participation in the Proxed.ai is open to individuals aged 18 and above,
				and to organisations that are duly authorised to enter into these Terms.
				By joining, you represent and warrant that you meet these eligibility
				requirements.
			</p>

			<h2>5. Use of Personal Data</h2>
			<p>
				We will collect and process certain personal data in connection with the
				Proxed.ai. Any personal data submitted will be handled in accordance
				with our Privacy Policy. By joining the Proxed.ai, you consent to our
				collection and use of this data as described therein.
			</p>

			<h2>6. Intellectual Property</h2>
			<p>
				All rights, title, and interest in and to the Proxed.ai platform,
				including but not limited to trademarks, logos, designs, code, text,
				graphics, and any other material, remain the property of Comonad Limited
				and/or its licensors. Your participation in the Proxed.ai does not grant
				you any licence, right, or interest in our intellectual property.
			</p>

			<h2>7. No Warranty</h2>
			<p>
				Participation in the Proxed.ai and any eventual beta access to the
				Service is provided on an "as is" and "as available" basis. To the
				fullest extent permissible by law, we disclaim all warranties, express
				or implied, including, without limitation, warranties of
				merchantability, fitness for a particular purpose, and non-infringement.
			</p>

			<h2>8. Limitation of Liability</h2>
			<p>
				To the maximum extent permitted by law, Comonad Limited, its officers,
				directors, employees, and affiliates shall not be liable for any direct,
				indirect, incidental, special, or consequential damages, or any loss of
				profits or revenues, arising out of or in connection with your
				participation in the Proxed.ai or use of the Service, even if we have
				been advised of the possibility of such damages.
			</p>

			<h2>9. Termination</h2>
			<p>
				We may remove you from the Proxed.ai at any time, for any reason, or for
				no reason, without liability. You may also request to be removed from
				the Proxed.ai at any time.
			</p>

			<h2>10. Governing Law and Jurisdiction</h2>
			<p>
				These Terms shall be governed by and construed in accordance with the
				laws of England and Wales, without regard to its conflict of law
				principles. Any disputes arising out of or relating to these Terms shall
				be subject to the exclusive jurisdiction of the courts of England and
				Wales.
			</p>

			<h2>11. Severability</h2>
			<p>
				If any provision of these Terms is deemed unenforceable or invalid under
				applicable law, such provision will be modified to reflect the parties'
				intention or eliminated to the minimum extent necessary, so that these
				Terms shall otherwise remain in full force and effect.
			</p>

			<h2>12. Entire Agreement</h2>
			<p>
				These Terms constitute the entire agreement between you and Comonad
				Limited concerning the Proxed.ai, and supersede all prior or
				contemporaneous communications, whether electronic, oral, or written,
				between you and us.
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
					By joining the Proxed.ai, you acknowledge that you have read,
					understood, and agree to be bound by these Terms.
				</p>
			</div>
		</>
	);
}

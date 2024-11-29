import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy - diet.tools",
	description: "Privacy Policy for diet.tools",
};

export default function PrivacyPage() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
			<p className="text-sm mb-4">Effective Date: 12.10.2025</p>

			<div className="prose dark:prose-invert max-w-none">
				<p className="mb-4">
					At Mitryco LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
					we value your privacy and are committed to protecting your personal
					information. This Privacy Policy explains how we collect, use, and
					safeguard your information when you use diet.tools (the
					&quot;Website&quot;) and any related services.
				</p>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">
						1. Information We Collect
					</h2>
					<p>We collect the following types of information:</p>
					<ul className="list-disc pl-6 mt-2">
						<li>
							<strong>Personal Information:</strong> Name, email address, and
							account credentials when you register
						</li>
						<li>
							<strong>Health and Fitness Data:</strong> Body composition,
							dietary preferences, fitness goals, and meal preferences
						</li>
						<li>
							<strong>Usage Data:</strong> Information about how you interact
							with our Website, including browsing patterns and technical data
						</li>
						<li>
							<strong>Device Information:</strong> Browser type, IP address, and
							device identifiers
						</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">
						2. How We Use Your Information
					</h2>
					<p>We use your information to:</p>
					<ul className="list-disc pl-6 mt-2">
						<li>Generate personalized meal plans based on your inputs</li>
						<li>Improve and optimize our Website and services</li>
						<li>Communicate with you about updates and changes</li>
						<li>Ensure the security and proper functioning of our Website</li>
						<li>Comply with legal obligations</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">3. Data Protection</h2>
					<p>
						We implement appropriate technical and organizational measures to
						protect your personal information. However, no method of
						transmission over the Internet is 100% secure. While we strive to
						protect your data, we cannot guarantee its absolute security.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
					<p>
						We retain your personal information only for as long as necessary to
						provide you with our services and as required by applicable law. You
						can request deletion of your account and associated data at any
						time.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">
						5. Cookies and Tracking
					</h2>
					<p>
						We use cookies and similar tracking technologies to improve your
						browsing experience and analyze Website usage. You can control
						cookie preferences through your browser settings.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
					<p>You have the right to:</p>
					<ul className="list-disc pl-6 mt-2">
						<li>Access your personal data</li>
						<li>Correct inaccurate data</li>
						<li>Request deletion of your data</li>
						<li>Object to data processing</li>
						<li>Export your data</li>
						<li>Withdraw consent at any time</li>
					</ul>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">
						7. Third-Party Services
					</h2>
					<p>
						We may use third-party services to help operate our Website and
						provide our services. These services may have access to your
						personal information only to perform specific tasks on our behalf
						and are obligated not to disclose or use it for any other purpose.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">
						8. Children&apos;s Privacy
					</h2>
					<p>
						Our Website is not intended for use by individuals under the age of
						18 without parental consent. We do not knowingly collect personal
						information from children under 18. If you become aware that a child
						has provided us with personal information, please contact us.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">
						9. Changes to This Policy
					</h2>
					<p>
						We may update this Privacy Policy from time to time. We will notify
						you of any changes by posting the new Privacy Policy on this page
						and updating the effective date at the top of this policy.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
					<p>
						If you have any questions about this Privacy Policy or our data
						practices, please contact us through our contact form or email us at
						privacy@diet.tools.
					</p>
				</section>
			</div>
		</div>
	);
}

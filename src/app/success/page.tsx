"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
	const router = useRouter();

	useEffect(() => {
		// Add delay for Google Tag Manager to capture the event
		const redirectTimer = setTimeout(() => {
			router.push("/me");
		}, 2000); // 2 second delay

		return () => clearTimeout(redirectTimer);
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold mb-4">Thank you for your purchase!</h1>
				<p className="mb-4">You will be redirected shortly...</p>
				<Link href="/me" className="text-blue-500 hover:text-blue-700 underline">
					Click here if you are not redirected automatically
				</Link>
			</div>
		</div>
	);
}

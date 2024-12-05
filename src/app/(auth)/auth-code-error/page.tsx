"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthError {
	error: string;
	error_description: string;
	error_code?: string;
}

export default function AuthErrorPage() {
	const [error, setError] = useState<AuthError | null>(null);

	useEffect(() => {
		// Get error details from URL hash
		const hash = window.location.hash.substring(1);
		const params = new URLSearchParams(hash);

		if (params.get("error")) {
			setError({
				error: params.get("error") || "",
				error_description: params.get("error_description") || "",
				error_code: params.get("error_code"),
			});
		}
	}, []);

	if (!error) {
		return null;
	}

	return (
		<div className="container flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-destructive">
						Authentication Error
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<h3 className="font-medium">Description</h3>
							<p className="text-muted-foreground">
								{decodeURIComponent(
									error.error_description.replace(/\+/g, " "),
								)}
							</p>
						</div>
						<div className="pt-4">
							<a
								href="/login"
								className="text-primary hover:text-primary/80 underline"
							>
								Return to login
							</a>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

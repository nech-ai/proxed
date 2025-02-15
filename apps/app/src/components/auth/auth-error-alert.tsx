"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@proxed/ui/components/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AuthErrorParams {
	error?: string;
	error_description?: string;
	error_code?: string;
	message?: string;
}

function getErrorMessage(params: AuthErrorParams) {
	// First check for explicit error description
	if (params.error_description) {
		return {
			message: decodeURIComponent(params.error_description).replace(/\+/g, " "),
			title: "Authentication Error",
		};
	}

	// Handle specific error codes
	switch (params.error_code) {
		// Access & Permissions
		case "anonymous_provider_disabled":
			return {
				message: "Anonymous sign-ins are disabled",
				title: "Access Denied",
			};
		case "signup_disabled":
			return {
				message: "Sign ups are disabled on the server",
				title: "Signup Disabled",
			};
		case "not_admin":
			return {
				message: "You don't have admin privileges",
				title: "Access Denied",
			};
		case "no_authorization":
			return {
				message: "Your session has expired. Please sign in again",
				title: "Authorization Required",
			};

		// Authentication Flow
		case "bad_code_verifier":
		case "flow_state_expired":
		case "flow_state_not_found":
			return {
				message: "Authentication flow expired. Please try again",
				title: "Authentication Failed",
			};
		case "invalid_credentials":
			return {
				message: "Invalid email or password",
				title: "Authentication Failed",
			};

		// Email Related
		case "email_exists":
			return {
				message: "An account with this email already exists",
				title: "Email In Use",
			};
		case "email_not_confirmed":
			return {
				message: "Please verify your email address before signing in",
				title: "Email Not Verified",
			};
		case "email_provider_disabled":
			return {
				message: "Email/password sign up is not available",
				title: "Sign Up Disabled",
			};
		case "email_address_invalid":
			return {
				message: "Please use a valid email address",
				title: "Invalid Email",
			};

		// Rate Limits & Timeouts
		case "over_request_rate_limit":
			return {
				message: "Too many attempts. Please try again later",
				title: "Rate Limited",
			};
		case "over_email_send_rate_limit":
			return {
				message:
					"Too many emails sent. Please wait a while before trying again",
				title: "Rate Limited",
			};
		case "over_sms_send_rate_limit":
			return {
				message: "Too many SMS sent. Please wait a while before trying again",
				title: "Rate Limited",
			};
		case "request_timeout":
			return {
				message: "Request timed out. Please try again",
				title: "Timeout",
			};

		// Sessions
		case "session_expired":
		case "session_not_found":
			return {
				message: "Your session has expired. Please sign in again",
				title: "Session Expired",
			};
		case "refresh_token_not_found":
		case "refresh_token_already_used":
			return {
				message: "Your session is invalid. Please sign in again",
				title: "Invalid Session",
			};

		// MFA
		case "mfa_challenge_expired":
			return {
				message: "MFA challenge expired. Please try again",
				title: "MFA Failed",
			};
		case "mfa_factor_not_found":
			return {
				message: "MFA factor not found. Please set up MFA again",
				title: "MFA Error",
			};
		case "mfa_factor_name_conflict":
			return {
				message: "This MFA factor name is already in use",
				title: "MFA Error",
			};
		case "too_many_enrolled_mfa_factors":
			return {
				message: "Maximum number of MFA factors reached",
				title: "MFA Limit Reached",
			};

		// OAuth & SSO
		case "bad_oauth_callback":
		case "bad_oauth_state":
			return {
				message: "OAuth authentication failed. Please try again",
				title: "Authentication Failed",
			};
		case "oauth_provider_not_supported":
		case "provider_disabled":
			return {
				message: "This sign in method is not available",
				title: "Provider Disabled",
			};
		case "provider_email_needs_verification":
			return {
				message: "Please verify your email address to continue",
				title: "Verification Required",
			};

		// User Management
		case "user_banned":
			return {
				message: "This account has been banned",
				title: "Account Banned",
			};
		case "user_not_found":
			return { message: "Account not found", title: "Not Found" };
		case "user_already_exists":
			return {
				message: "An account with these credentials already exists",
				title: "Account Exists",
			};
		case "user_sso_managed":
			return {
				message: "This account is managed by SSO and cannot be modified",
				title: "SSO Managed",
			};

		// Validation & Security
		case "validation_failed":
			return {
				message: "Please check your input and try again",
				title: "Validation Error",
			};
		case "weak_password":
			return {
				message: "Password is too weak. Please use a stronger password",
				title: "Weak Password",
			};
		case "same_password":
			return {
				message: "New password must be different from your current password",
				title: "Invalid Password",
			};
		case "captcha_failed":
			return {
				message: "Captcha verification failed. Please try again",
				title: "Verification Failed",
			};
	}

	// Handle specific error types without error_code
	switch (params.error) {
		case "auth-code-error":
			return {
				message: "Invalid or expired verification code",
				title: "Verification Failed",
			};
		case "invitation-not-found":
			return {
				message: "We couldn't find the invitation you were looking for",
				title: "Invitation Not Found",
			};
	}

	// Handle success messages
	if (params.message === "password_updated") {
		return {
			message: "Please sign in with your new password",
			title: "Password Updated Successfully",
			success: true,
		};
	}

	// Default error for unhandled cases
	return {
		message: "An unexpected error occurred. Please try again",
		title: "Error",
	};
}

function getParamsFromHash() {
	if (typeof window === "undefined") return {};
	const hash = window.location.hash.substring(1); // remove the # symbol
	return Object.fromEntries(new URLSearchParams(hash));
}

export function AuthErrorAlert({ params }: { params: AuthErrorParams }) {
	const [hashParams, setHashParams] = useState<AuthErrorParams>({});

	useEffect(() => {
		setHashParams(getParamsFromHash());
	}, []);

	const error = getErrorMessage({ ...params, ...hashParams });

	if (!error) return null;

	return (
		<Alert
			variant={error.success ? "default" : "destructive"}
			className="mb-6 max-w-[400px]"
		>
			{error.success ? (
				<CheckCircle2 className="size-5" />
			) : (
				<AlertCircle className="size-5" />
			)}
			<AlertTitle>{error.title}</AlertTitle>
			<AlertDescription>{error.message}</AlertDescription>
		</Alert>
	);
}

'use client';

import { signIn } from '@auth/create/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const isDev = process.env.NEXT_PUBLIC_CREATE_ENV === 'DEVELOPMENT';

const PROVIDER_LABELS = {
	google: 'Google',
	facebook: 'Facebook',
	twitter: 'Twitter / X',
	apple: 'Apple',
};

export default function SocialDevShimPage() {
	const navigate = useNavigate();

	useEffect(() => {
		if (!isDev) {
			navigate('/');
		}
	}, [navigate]);

	if (!isDev) {
		return null;
	}

	const params =
		typeof window !== 'undefined'
			? new URLSearchParams(window.location.search)
			: new URLSearchParams();
	const provider = params.get('provider') || 'google';
	const callbackUrl = params.get('callbackUrl') || '/';
	const label = PROVIDER_LABELS[provider] || provider;

	const [email, setEmail] = useState('');
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [missingSecrets, setMissingSecrets] = useState(null);

	useEffect(() => {
		fetch(
			`/api/__create/check-social-secrets?provider=${encodeURIComponent(provider)}`
		)
			.then((r) => r.json())
			.then((data) => setMissingSecrets(data.missing || []))
			.catch((err) => {
				console.error('Failed to check social secrets:', err);
			});
	}, [provider]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			await signIn('dev-social', { email, name, provider, callbackUrl });
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Sign-in failed. Please try again.'
			);
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center font-sans bg-gray-100">
			<div className="bg-white rounded-xl p-8 w-full max-w-[400px] shadow-md">
				<div className="bg-amber-50 border border-amber-400 rounded-lg p-3 mb-4 text-[13px] text-amber-800">
					<strong>Development Mode</strong> — This is a simulated{' '}
					{label} sign-in. In production, users will see the real{' '}
					{label} OAuth screen.
				</div>

				{error && (
					<div className="bg-red-50 border border-red-400 rounded-lg p-3 mb-4 text-[13px] text-red-900">
						<strong>Sign-in error</strong> — {error}
					</div>
				)}

				{missingSecrets && missingSecrets.length > 0 && (
					<div className="bg-red-50 border border-red-400 rounded-lg p-3 mb-4 text-[13px] text-red-900">
						<strong>Missing secrets</strong> — {label} sign-in
						won't work in production until you add these secrets to
						your project:{' '}
						{missingSecrets.map((s) => (
							<code
								key={s}
								className="bg-red-200 px-1 rounded text-[12px]"
							>
								{s}
							</code>
						))}
					</div>
				)}

				<h2 className="mt-0 mb-6 text-xl font-semibold">
					Sign in with {label}
				</h2>

				<form onSubmit={handleSubmit}>
					<label className="block mb-4">
						<span className="block text-sm font-medium mb-1.5">
							Email
						</span>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="test@example.com"
							className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm"
						/>
					</label>

					<label className="block mb-6">
						<span className="block text-sm font-medium mb-1.5">
							Display Name{' '}
							<span className="text-gray-400">(optional)</span>
						</span>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Test User"
							className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm"
						/>
					</label>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-2.5 rounded-lg border-none text-white text-sm font-medium bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-default cursor-pointer"
					>
						{loading
							? 'Signing in...'
							: `Continue as ${label} user`}
					</button>
				</form>
			</div>
		</div>
	);
}

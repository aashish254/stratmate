const ALLOWED_PROVIDERS = new Set(['google', 'facebook', 'twitter', 'apple']);

export function GET(request) {
	if (process.env.NEXT_PUBLIC_CREATE_ENV !== 'DEVELOPMENT') {
		return Response.json({ error: 'not found' }, { status: 404 });
	}

	const url = new URL(request.url);
	const provider = url.searchParams.get('provider');

	if (!provider || !ALLOWED_PROVIDERS.has(provider.toLowerCase())) {
		return Response.json({ error: 'invalid provider' }, { status: 400 });
	}

	const key = provider.toUpperCase();
	const clientId = `${key}_CLIENT_ID`;
	const clientSecret = `${key}_CLIENT_SECRET`;

	const missing = [];
	if (!process.env[clientId]) missing.push(clientId);
	if (!process.env[clientSecret]) missing.push(clientSecret);

	return Response.json({ provider, missing });
}

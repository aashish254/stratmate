import { useCallback } from 'react';
import { useAuth } from './useAuth';

export const useUser = () => {
	const { auth, isReady } = useAuth();
	const user = auth?.user || null;
	const fetchUser = useCallback(async () => {
		return user;
	}, [user]);
	return { user, data: user, loading: !isReady, refetch: fetchUser };
};
export default useUser;

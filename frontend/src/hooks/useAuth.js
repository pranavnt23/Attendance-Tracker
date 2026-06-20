import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { token, me, isAuthenticated, login: setLoginStore, logout: setLogoutStore, setMe } = useAuthStore();

  // React Query query to fetch/validate current user
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: !!token && (!me || !me.student_name), // Only query if token exists but full user metadata hasn't been fetched
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  // Sync profile metadata to store once loaded
  if (meQuery.data && (!me || !me.student_name)) {
    setMe(meQuery.data);
  }

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ register_no, password }) => authService.login(register_no, password),
    onSuccess: async (data) => {
      // Store token and student metadata in state
      setLoginStore(data.access_token, {
        student_id: data.student_id,
        class_id: data.class_id,
        role: data.role
      });
      // Trigger profile fetch
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });

  const logout = () => {
    setLogoutStore();
    queryClient.clear();
  };

  return {
    user: me,
    isAuthenticated,
    isAuthenticating: loginMutation.isPending || meQuery.isFetching,
    error: loginMutation.error || meQuery.error,
    login: loginMutation.mutateAsync,
    logout,
    refetchUser: meQuery.refetch
  };
};

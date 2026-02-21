import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, configApi } from '../services/api';
import { Campaign } from '../types';
import toast from 'react-hot-toast';

export function useTwilioConfig() {
  return useQuery<{ twilioConfigured: boolean; twilioError: string | null; baseUrl: string | null }>({
    queryKey: ['config-status'],
    queryFn: async () => {
      const res = await configApi.getStatus();
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useCampaigns() {
  return useQuery<{ success: boolean; data: Campaign[] }>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await campaignsApi.getAll();
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; script: string }) => campaignsApi.create(data),
    onSuccess: () => {
      toast.success('Campaign created successfully');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useStartCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsApi.start(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Campaign started');
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => {
      toast.success('Campaign deleted');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

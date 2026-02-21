import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../services/api';
import { Contact, PaginatedResponse, DashboardStats } from '../types';
import toast from 'react-hot-toast';

interface ContactFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export function useContacts(filters: ContactFilters = {}) {
  return useQuery<PaginatedResponse<Contact>>({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      const res = await contactsApi.getAll(filters);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useContactStats() {
  return useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ['contact-stats'],
    queryFn: async () => {
      const res = await contactsApi.getStats();
      return res.data;
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useUploadContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => contactsApi.uploadCSV(file),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Contacts uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => {
      toast.success('Contact deleted');
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
    },
  });
}

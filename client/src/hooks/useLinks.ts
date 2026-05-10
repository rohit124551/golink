import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchLinks, createLink, updateLink, deleteLink, toggleLink } from '../lib/api.ts'
import { generateSlug } from '../lib/utils.ts'

export function useLinks() {
  const queryClient = useQueryClient()

  const { data: links = [], isLoading, error } = useQuery({
    queryKey: ['links'],
    queryFn: fetchLinks,
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => {
      const slug = payload.slug || generateSlug()
      return createLink({
        slug,
        destination_url: payload.destination_url,
        is_active: payload.is_active ?? true,
        is_custom: !!payload.slug,
        expires_at: payload.expires_at || null,
        click_count: 0,
        unique_clicks: 0,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ slug, payload }: { slug: string, payload: any }) => updateLink(slug, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => deleteLink(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ slug, isActive }: { slug: string, isActive: boolean }) => toggleLink(slug, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })

  return {
    links,
    isLoading,
    error,
    createLink: createMutation.mutateAsync,
    updateLink: updateMutation.mutateAsync,
    deleteLink: deleteMutation.mutateAsync,
    toggleLink: toggleMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

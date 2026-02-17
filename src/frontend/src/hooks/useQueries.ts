import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Language, ConversationScenario, CultureContent, MinigameConfig, UserProgress, UserProfile, GameMode } from '../backend';

export function useGetLanguages() {
  const { actor, isFetching } = useActor();

  return useQuery<Language[]>({
    queryKey: ['languages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLanguages(BigInt(0), BigInt(100));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetConversationScenarios(languageId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<ConversationScenario[]>({
    queryKey: ['conversationScenarios', languageId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversationScenarios(languageId, BigInt(0), BigInt(20));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCultureEntries(languageId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<CultureContent[]>({
    queryKey: ['cultureEntries', languageId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCultureEntries(languageId, BigInt(0), BigInt(20));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMinigameConfigs(languageId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<MinigameConfig[]>({
    queryKey: ['minigameConfigs', languageId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMinigameConfigs(languageId, BigInt(0), BigInt(20));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProgress() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProgress | null>({
    queryKey: ['userProgress'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getUserProgress();
      } catch (error) {
        // User not authenticated or no progress yet
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        // User not authenticated
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });
}

export function useSetSelectedLanguage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (languageId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setSelectedLanguage(languageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCompleteDialogue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dialogueId, xpReward }: { dialogueId: bigint; xpReward: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.completeDialogue(dialogueId, xpReward);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCompleteCultureEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, xpReward }: { entryId: bigint; xpReward: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.completeCultureEntry(entryId, xpReward);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCompleteMinigame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameMode, xpReward, score }: { gameMode: GameMode; xpReward: bigint; score: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.completeMinigame(gameMode, xpReward, score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

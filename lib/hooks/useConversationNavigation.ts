import { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Custom hook to handle conversation navigation
 * Centralizes routing logic for the messages page
 */
export function useConversationNavigation() {
  const router = useRouter();

  const navigateToConversation = useCallback(
    (conversationId: string) => {
      router.push(`/messages?conversationId=${conversationId}`);
    },
    [router]
  );

  const navigateToList = useCallback(() => {
    router.push("/messages");
  }, [router]);

  return {
    navigateToConversation,
    navigateToList,
  };
}

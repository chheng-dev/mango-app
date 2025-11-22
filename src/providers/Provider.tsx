import { QueryProvider } from "@/providers/QueryProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { UserProvider } from "@/providers/user-provider";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <UserProvider>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </UserProvider>
    </QueryProvider>
  );
}
'use client';
import { useUsers } from '@/hooks/useUsers';

export default function Page() {
  const { data, isLoading, error } = useUsers();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
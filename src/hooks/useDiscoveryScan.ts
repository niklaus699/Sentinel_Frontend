import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDiscoveryScan() {
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();

  const triggerScan = async () => {
    setIsScanning(true);
    try {
      await api.post('/api/discovery/scan/');
      
      // Invalidate and refetch updated data across the app
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      await queryClient.invalidateQueries({ queryKey: ['findings'] });
      await queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
      
      // You can add a toast notification here
      console.log("Scan triggered successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return { triggerScan, isScanning };
}
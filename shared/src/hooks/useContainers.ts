import type { Containers } from 'react-native-dynamic-module-federation';
import { fetchContainers } from '../containers';
import { useQuery } from '@tanstack/react-query';
import useForeground from './useForeground';
import { generateResolver } from '../resolver';
import {
  ScriptManager,
  type ScriptLocatorResolver,
} from '@callstack/repack/client';
import { useRef } from 'react';

interface Props {
  suspense?: boolean;
}

const useContainers = ({ suspense }: Props = {}) => {
  const resolver = useRef<ScriptLocatorResolver>();

  const { data, refetch } = useQuery<Containers>({
    queryKey: ['fetch-containers'],
    queryFn: async () => {
      const newContainers = await fetchContainers();
      const newResolver = generateResolver(newContainers);
      ScriptManager.shared.addResolver(newResolver);
      if (resolver.current) {
        ScriptManager.shared.removeResolver(resolver.current);
      }
      resolver.current = newResolver;
      return newContainers;
    },
    suspense,
  });

  useForeground(() => {
    refetch();
  });

  return data;
};

export default useContainers;

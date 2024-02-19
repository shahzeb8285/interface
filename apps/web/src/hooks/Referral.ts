import { ApolloClient, ApolloError, InMemoryCache, NormalizedCacheObject, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";
import { ChainId } from '@uniswap/sdk-core'

// import {  referralApolloClient } from "./apollo";

const REFERRAL_SUBGRAPH_URL: Record<number, string> = {
  [ChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/shahzeb8285/v2referral',
  }



const query = gql`
  query Comissions($toAddress: Bytes) {
    comissionItems(
      where: { toAddress: $toAddress }
      orderBy: timestamp
      subgraphError: allow
    ) {
      id
      tokenAddress
      amount
      toAddress
      fromAddress
      tokenSymbol

      tokenDecimal
      timestamp
      transactionHash
    }
  }
`;

export const referralApolloClient: Record<number, ApolloClient<NormalizedCacheObject>> = {

  [ChainId.GOERLI]: new ApolloClient({
    cache: new InMemoryCache(),
    uri: REFERRAL_SUBGRAPH_URL[ChainId.GOERLI],
  }),

}
export default function useReferralComissionQueryQuery(
  address: string,
  chainId: number
): { error?: ApolloError; isLoading: boolean; data: any[] } {

  const {
    data,
    loading: isLoading,
    error,
  } = useQuery(query, {
    variables: {
      toAddress: address,
    },
    client: referralApolloClient[chainId],
  });

  return useMemo(
    () => ({
      error,
      isLoading,
      data,
    }),
    [data, error, isLoading]
  );
}

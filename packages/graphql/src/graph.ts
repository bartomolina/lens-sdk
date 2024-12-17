import type { FragmentOf } from 'gql.tada';
import {
  GraphFragment,
  PaginatedResultInfoFragment,
  SelfFundedTransactionRequestFragment,
  TransactionWillFailFragment,
} from './fragments';
import { type RequestOf, graphql } from './graphql';

const CreateGraphResponseFragment = graphql(
  `fragment CreateGraphResponse on CreateGraphResponse {
    __typename
    hash
  }`,
);
export type CreateGraphResponse = FragmentOf<typeof CreateGraphResponseFragment>;

const CreateGraphResultFragment = graphql(
  `fragment CreateGraphResult on CreateGraphResult {
    ...on CreateGraphResponse {
      ...CreateGraphResponse
    }
    ...on SelfFundedTransactionRequest {
      ...SelfFundedTransactionRequest
    }
    ...on TransactionWillFail {
      ...TransactionWillFail
    }
  }`,
  [CreateGraphResponseFragment, SelfFundedTransactionRequestFragment, TransactionWillFailFragment],
);
export type CreateGraphResult = FragmentOf<typeof CreateGraphResultFragment>;

export const CreateGraphMutation = graphql(
  `mutation CreateGraph($request: CreateGraphRequest!) {
    value: createGraph(request: $request) {
      ...CreateGraphResult
    }
  }`,
  [CreateGraphResultFragment],
);
export type CreateGraphRequest = RequestOf<typeof CreateGraphMutation>;

export const GraphQuery = graphql(
  `query Graph($request: GraphRequest!) {
    value: graph(request: $request) {
      ...Graph
    }
  }`,
  [GraphFragment],
);
export type GraphRequest = RequestOf<typeof GraphQuery>;

export const GraphsQuery = graphql(
  `query Graphs($request: GraphsRequest!) {
    value: graphs(request: $request) {
      __typename
      items {
        ...Graph
      }
      pageInfo {
        ...PaginatedResultInfo
      }
    }
  }`,
  [GraphFragment, PaginatedResultInfoFragment],
);
export type GraphsRequest = RequestOf<typeof GraphsQuery>;

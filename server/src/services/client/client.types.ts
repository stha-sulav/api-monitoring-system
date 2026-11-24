import type { HydratedDocument, QueryFilter } from "mongoose";

export interface ClientFindOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

export interface IBaseClientRepository<T> {
  create(
    clientData: Omit<T, "createdAt" | "updatedAt">,
  ): Promise<HydratedDocument<T>>;
  findById(clientId: string): Promise<HydratedDocument<T> | null>;
  findBySlug(slug: string): Promise<HydratedDocument<T> | null>;
  find(
    filters?: QueryFilter<T>,
    options?: ClientFindOptions,
  ): Promise<HydratedDocument<T>[]>;
  count(filters?: QueryFilter<T>): Promise<number>;
}

export interface ClientIdFilterProps<TDoc> {
  clientId: string;
  filters?: QueryFilter<TDoc>;
}

export interface FindByKeyValueProps {
  keyValue: string;
  includeInactive?: boolean;
}

export interface IBaseApiKeyRepository<
  TDoc,
  TCreate = Omit<TDoc, "createdAt" | "updatedAt">,
> {
  create(apiKeyData: TCreate): Promise<HydratedDocument<TDoc>>;
  findByClientId(
    props: ClientIdFilterProps<TDoc>,
  ): Promise<HydratedDocument<TDoc>[]>;
  findByKeyValue(
    props: FindByKeyValueProps,
  ): Promise<HydratedDocument<TDoc> | null>;
  countByClientId(props: ClientIdFilterProps<TDoc>): Promise<number>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  from: number | null;
  to: number | null;
}

export interface ZoneOption {
  id: number;
  code: string;
  name: string;
  trunk_cables_count?: number;
  nap_boxes_count?: number;
  splice_closures_count?: number;
  customers_count?: number;
}

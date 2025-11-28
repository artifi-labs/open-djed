export type DataRow = {
  date: string;
} & Record<Exclude<string, "date">, number>;

export type AggregationMethod = "sum" | "avg" | "min" | "max";
export type AggregationConfig = Record<string, AggregationMethod[]>;

export function timeBucketFromStart(
  date: Date,
  intervalMs: number,
  start: Date
): Date {
  const offset = date.getTime() - start.getTime();
  return new Date(start.getTime() + Math.floor(offset / intervalMs) * intervalMs);
}

export function aggregateByBucket(
  data: DataRow[],
  intervalMs: number,
  start: Date,
  aggregations: AggregationConfig
): DataRow[] {
  type Bucket = Record<string, number> & {
    date: string;
  };

  const buckets = new Map<string, Bucket>();

  for (const row of data) {
    const bucketKey = timeBucketFromStart(new Date(row.date), intervalMs, start).toISOString();

    // Create bucket if missing
    if (!buckets.has(bucketKey)) {
      const baseBucket: Bucket = { date: bucketKey } as Bucket;

      for (const col in aggregations) {
        const methods = aggregations[col];

        if (methods.includes("sum")) baseBucket[`${col}_sum`] = 0;

        if (methods.includes("avg")) {
          baseBucket[`${col}_sumForAvg`] = 0;
          baseBucket[`${col}_countForAvg`] = 0;
        }

        if (methods.includes("min")) baseBucket[`${col}_min`] = Infinity;
        if (methods.includes("max")) baseBucket[`${col}_max`] = -Infinity;
      }

      buckets.set(bucketKey, baseBucket);
    }

    const bucket = buckets.get(bucketKey);
    if (!bucket) continue;
    for (const col in aggregations) {
      const value = row[col];
      if (value == null) continue;

      const methods = aggregations[col];

      if (methods.includes("sum")) {
        bucket[`${col}_sum`] += value;
      }

      if (methods.includes("avg")) {
        bucket[`${col}_sumForAvg`] += value;
        bucket[`${col}_countForAvg`] += 1;
      }

      if (methods.includes("min")) {
        bucket[`${col}_min`] = Math.min(bucket[`${col}_min`], value);
      }

      if (methods.includes("max")) {
        bucket[`${col}_max`] = Math.max(bucket[`${col}_max`], value);
      }
    }
  }

  // Build final output (remove internal fields)
  const result: DataRow[] = [];

  for (const bucket of buckets.values()) {
    const output: DataRow = { date: bucket.date } as DataRow;

    for (const col in aggregations) {
      const methods = aggregations[col];

      if (methods.includes("sum")) {
        output[`${col}_sum`] = bucket[`${col}_sum`];
      }

      if (methods.includes("avg")) {
        const count = bucket[`${col}_countForAvg`];
        const sum = bucket[`${col}_sumForAvg`];
        output[`${col}_avg`] = count > 0 ? sum / count : 0;
      }

      if (methods.includes("min")) {
        output[`${col}_min`] = bucket[`${col}_min`];
      }

      if (methods.includes("max")) {
        output[`${col}_max`] = bucket[`${col}_max`];
      }
    }

    result.push(output);
  }

  return result.sort((a, b) => +new Date(a.date) - +new Date(b.date));
}

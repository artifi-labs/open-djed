import { useQuery } from "@tanstack/react-query"
import { useApiClient } from "@/context/ApiClientContext"
import { protocolKeys } from "@/queries/protocol/keys"
import { protocolDataSchema } from "@/queries/protocol/protocol/protocol.schema"

export function useProtocolDataQuery() {
  const client = useApiClient()

  return useQuery({
    queryKey: protocolKeys.protocolData(),

    queryFn: async () => {
      const res = await client.api["protocol-data"].$get()

      if (!res.ok) throw new Error("Error fetching Protocol Data")

      const json = await res.json()

      const parsed = protocolDataSchema.parse(json)

      return parsed
    },
  })
}

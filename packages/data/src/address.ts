import { Data, credentialToAddress, getAddressDetails } from '@lucid-evolution/lucid'
import type { Network } from '@open-djed/registry'

// TODO: Support none-"regular" address formats (without stake credential, script addresses, etc).
export const AddressSchema = Data.Object({
  paymentKeyHash: Data.Tuple([Data.Bytes()], { hasConstr: true }),
  stakeKeyHash: Data.Tuple(
    [Data.Tuple([Data.Tuple([Data.Bytes()], { hasConstr: true })], { hasConstr: true })],
    { hasConstr: true },
  ),
})

type Address = Data.Static<typeof AddressSchema>

export const fromBech32 = (address: string): Address => {
  const { paymentCredential, stakeCredential } = getAddressDetails(address)
  if (!paymentCredential) {
    throw new Error(`Couldn't get payment credential from address "${address}".`)
  }
  if (!stakeCredential) {
    throw new Error(`Couldn't get stake credential from address "${address}".`)
  }
  return {
    paymentKeyHash: [paymentCredential.hash],
    stakeKeyHash: [[[stakeCredential.hash]]],
  }
}

export const toBech32 = (address: Address, network: Network): string => {
  return credentialToAddress(
    network,
    { type: 'Key', hash: address.paymentKeyHash[0] },
    { type: 'Key', hash: address.stakeKeyHash[0][0][0] },
  )
}

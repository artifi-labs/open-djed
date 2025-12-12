import { Actions } from '../components/Actions'
import { useLoaderData } from 'react-router'
import Simulator from '~/components/Simulator'
import type { LoaderData } from '~/types/loader'

export function meta() {
  const { network } = useLoaderData<LoaderData>()
  return [
    { title: 'Open DJED | SHEN Reservecoin - Mint & burn' },
    {
      name: 'description',
      content:
        'Mint and burn SHEN reservecoin on Cardano with our open-source platform. Transparent, free alternative to DJED.xyz for managing your SHEN holdings 24/7.',
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://${network === 'Preprod' ? 'preprod.' : ''}djed.artifex.finance/shen`,
    },
  ]
}

export default function ShenPage() {
  return (
    <div className="flex flex-col w-full justify-center items-center">
      <Actions token="SHEN" />
      <Simulator tokenName={'SHEN'} currentAdaValue={0.47} />
    </div>
  )
}

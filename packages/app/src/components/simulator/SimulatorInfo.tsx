import Image from "next/image"
import { useTranslations } from "next-intl"

const ITEMS = [
  {
    text: "simulator.whatIsSimulator.items.fees",
    icon: "/components/what-is-yield/orders-5.svg",
    name: "orders-5",
  },
  {
    text: "simulator.whatIsSimulator.items.rewards",
    icon: "/components/what-is-yield/rewards.svg",
    name: "rewards",
  },
  {
    text: "simulator.whatIsSimulator.items.feesEarned",
    icon: "/components/what-is-yield/fees.svg",
    name: "fees",
  },
  {
    text: "simulator.whatIsSimulator.items.profitOrLoss",
    icon: "/components/what-is-yield/buying-selling.svg",
    name: "buying-selling",
  },
  {
    text: "simulator.whatIsSimulator.items.totalEstimatedPNL",
    icon: "/components/what-is-yield/orders-1.svg",
    name: "orders-1",
  },
]

const SimulatorInfo = () => {
  const t = useTranslations()

  return (
    <div className="text-secondary flex flex-col gap-16 text-sm">
      <div className="flex flex-col gap-16">
        <p className="text-sm">{t("simulator.whatIsSimulator.description")}:</p>

        <ul className="flex flex-col gap-16">
          {ITEMS.map(({ text, icon, name }) => (
            <li key={text} className="flex items-center gap-16">
              <Image
                src={icon}
                alt={`${name}-picture`}
                width={40}
                height={40}
              />
              <span>{t(text)}</span>
            </li>
          ))}
        </ul>

        <p>{t("simulator.whatIsSimulator.disclaimer")}</p>
      </div>
    </div>
  )
}

export default SimulatorInfo

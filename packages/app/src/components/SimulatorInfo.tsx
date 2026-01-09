import Image from "next/image"

const ITEMS = [
  {
    text: "Fees you pay when buying and selling",
    icon: "/components/what-is-yield/orders-5.svg",
    name: "orders-5",
  },
  {
    text: "ADA rewards you earn while holding SHEN",
    icon: "/components/what-is-yield/rewards.svg",
    name: "rewards",
  },
  {
    text: "Fees earned from minting and burning activity in the protocol",
    icon: "/components/what-is-yield/fees.svg",
    name: "fees",
  },
  {
    text: "Profit or loss from ADA price movement",
    icon: "/components/what-is-yield/buying-selling.svg",
    name: "buying-selling",
  },
  {
    text: "Your total estimated PNL",
    icon: "/components/what-is-yield/orders-1.svg",
    name: "orders-1",
  },
]

const SimulatorInfo = () => {
  return (
    <div className="text-secondary flex flex-col gap-16 text-sm">
      <div className="flex flex-col gap-16">
        <p className="gap-16 text-sm">
          The Yield Simulator helps you understand how profitable a SHEN
          position could be. By entering the amount of SHEN, your buy and sell
          dates, and ADA prices, the tool estimates:
        </p>

        <ul className="flex flex-col gap-16">
          {ITEMS.map(({ text, icon, name }) => (
            <li key={text} className="flex items-center gap-16">
              <Image
                src={icon}
                alt={`${name}-picture`}
                width={40}
                height={40}
              />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <p>
          It's not a prediction tool - it's a calculator that shows how your
          returns change based on the inputs you choose, so you can plan your
          strategy with clarity.
        </p>
      </div>
    </div>
  )
}

export default SimulatorInfo

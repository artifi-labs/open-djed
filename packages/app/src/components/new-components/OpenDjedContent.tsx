import React from "react"

const OpenDjedContent = () => {
  return (
    <div className="text-secondary flex flex-col gap-16 text-sm">
      {/* What is Open Djed? */}
      <p className="gap-16 text-sm">
        Open DJED is a transparent, community-driven web app for interacting
        with the DJED algorithmic stablecoin on Cardano, built entirely open
        source by Artifi Labs. It recreates the original DJED experience with
        full protocol compatibility - offering a more reliable, accessible, and
        auditable alternative.
      </p>

      {/* Why Open Djed? */}
      <div className="flex flex-col gap-12">
        <h3 className="text-primary text-xl font-medium">Why Open DJED?</h3>
        <ul className="ml-3 flex list-disc flex-col pl-3">
          <li>
            <strong>Protocol-compatible:</strong> Same overcollateralized logic
            as DJED.
          </li>
          <li>
            <strong>Open source:</strong> Fully auditable, forkable, and
            community-owned.
          </li>
          <li>
            <strong>Community-first:</strong> Built for and by Cardano users.
          </li>
          <li>
            <strong>Reliable:</strong> Works even if the COTI app is down.
          </li>
          <li>
            <strong>Global access:</strong> No geographic restrictions.
          </li>
          <li>
            <strong>Transparent & low fees:</strong> Same COTI fee structure,
            ~0.1 ADA cheaper.
          </li>
        </ul>
      </div>

      {/* Our Mission */}
      <div className="flex flex-col gap-12">
        <h3 className="text-primary text-xl font-medium">Our Mission</h3>
        <div className="flex flex-col gap-12">
          <p>
            Open DJED was built to solve accessibility and reliability issues in
            the original app, ensuring everyone can interact with DJED
            seamlessly and transparently.
          </p>
          <p>
            Artifi Labs creates open, permissionless tools for the Cardano
            ecosystem-Open DJED is just the beginning. Join us in reshaping DeFi
            on Cardano - openly, transparently, together.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OpenDjedContent

// http://localhost:3000/

import type { MetaFunction } from "@remix-run/node"
import { ButtonHTMLAttributes } from "react"
import { getCardsValue } from "~/gameMachine"
import { GameMachineContext } from "~/root"

export const meta: MetaFunction = () => {
  return [{ title: "Dungeon 21" }]
}

export default function Index() {
  const context = GameMachineContext.useSelector((state) => state.context)
  const { deck, roundsPlayed, players, activePlayerId } = context

  const stateName = GameMachineContext.useSelector((state) => state.value)
  const isOnInitGame = GameMachineContext.useSelector((state) =>
    state.matches("Initial")
  )

  const game = GameMachineContext.useActorRef()

  return (
    <div>
      <header>
        <h1 className="m-auto text-5xl font-bold  w-fit">Counting Simulator</h1>
        <div className="">
          <p className="my-1 text-lg">Shoe Info: </p>
          <p>{deck.length} cards</p>
          <p>Rounds Played: {roundsPlayed}</p>

          <p>State: {JSON.stringify(stateName)} </p>
          {isOnInitGame ? (
            <Button onClick={() => game.send({ type: "START_GAME" })}>
              Start
            </Button>
          ) : null}
        </div>

        {players.map((player) => (
          <div key={player.id} className="">
            <h2
              className={`text-xl ${
                activePlayerId === player.id ? "font-bold" : ""
              }`}
            >
              {player.name}
            </h2>

            {player.hands.map((hand, i) => (
              <div key={i} className="">
                {hand.cards.map((card, i) => (
                  <div key={i}>
                    {card.isVisible ? `${card.value}${card.suit}` : "??"}
                  </div>
                ))}

                <div>Value: {getCardsValue(hand.cards)}</div>
                <div>Status: {hand.roundResult}</div>
                <div className="flex gap-x-2">
                  <Button
                    onClick={() =>
                      game.send({ type: "HIT", playerId: player.id })
                    }
                  >
                    Hit
                  </Button>
                  <Button
                    onClick={() =>
                      game.send({ type: "STAND", playerId: player.id })
                    }
                  >
                    Stand
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </header>

      <div>
        <pre>
          Context:{" "}
          {JSON.stringify(
            context,
            (key, value) => {
              if (key === "deck") {
                return "omitted"
              }
              return value
            },
            2
          )}
        </pre>
      </div>
    </div>
  )
}

function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        "px-3 py-1 bg-white hover:bg-neutral-100 border-neutral-200 border rounded",
        props.disabled ? "opacity-50" : "",
        props.className,
      ].join(" ")}
    />
  )
}

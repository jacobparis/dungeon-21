import type { LinksFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import { createGameMachine } from "./gameMachine"
import { createActorContext } from "@xstate/react"
import styles from "./tailwind.css"

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }]

const gameMachine = createGameMachine({
  id: `Dungeon21Machine`,
})

export const GameMachineContext = createActorContext(gameMachine, {
  inspect(event) {
    if (event.type === "@xstate.event") {
      console.log(event.event)
    }
  },
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <GameMachineContext.Provider>
          <Outlet />
        </GameMachineContext.Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

import { assign, createMachine, raise, enqueueActions, and } from "xstate"
import { shuffle } from "./misc"

const monsters = [
  {
    name: "Imp",
    level: 1,
  },
  {
    name: "Pixie",
    level: 2,
  },
  {
    name: "Goblin",
    level: 3,
  },
  {
    name: "Skeleton",
    level: 4,
  },
  {
    name: "Orc",
    level: 5,
  },
  {
    name: "Giant Spider",
    level: 6,
  },
  {
    name: "Gargoyle",
    level: 7,
  },
  {
    name: "Mimic",
    level: 8,
  },
  {
    name: "Ogre",
    level: 9,
  },
  {
    name: "Minotaur",
    level: 10,
  },
  {
    name: "Manticore",
    level: 10,
  },
  {
    name: "Golem",
    level: 10,
  },
  {
    name: "Dragon",
    level: 11,
  },
] as const

const loot = [
  {
    type: "weapon",
    name: "Dagger",
    level: 1,
    victoryPoints: 0,
  },
  {
    type: "armor",
    name: "Leather Armor",
    level: 1,
    victoryPoints: 0,
  },
  {
    type: "ring",
    name: "Ring of Protection",
  },
  {
    type: "scroll",
    name: "Scroll of Fireball",
  },
] as const

function initDeck() {
  const deck = []
  for (const monster of monsters) {
    deck.push(monster)
    deck.push(monster)
    deck.push(monster)
    deck.push(monster)
  }
  return deck
}

type Card = ReturnType<typeof initDeck>[number]

const initialPlayers = [
  {
    id: "player1",
    name: "Alice",
    hands: [
      {
        id: "Hand-0",
        cards: [] as Array<Card>,
        isFinished: false,
        roundResult: undefined as string | undefined,
      },
    ],
  },
  {
    id: "player2",
    name: "Bob",
    hands: [
      {
        id: "Hand-0",
        cards: [] as Array<Card>,
        isFinished: false,
        roundResult: undefined as string | undefined,
      },
    ],
  },
  {
    id: "player3",
    name: "Carol",
    hands: [
      {
        id: "Hand-0",
        cards: [] as Array<Card>,
        isFinished: false,
        roundResult: undefined as string | undefined,
      },
    ],
  },
]

export type Player = (typeof initialPlayers)[number]
export type Hand = Player["hands"][number]

export const createGameMachine = ({ id }: { id: string }) => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEl9cAXXdAGwGIBlAFQEEAlFgfQHE2AsgFEA2gAYAuolAAHAPaxquOfmkgAHogCMATi0AOEroDs+gMwAWLWbE6ATHYA0IAJ6IAbPq0kx1uzrNrfTExUwBfMOc0LDxCUgARMHoACXR8CFgGCBUwEgIANzkAa1yC4rBElLSMljkABTp0FzAAJ1g2dMq6VvEpJBB5RRoVNU0ECws7Eh0ddzEAVjsxfX0dfXdjZzcEa2NvM3cLfXn1rTt5izNjCKiMHAJiEi7U9Mzksh46gBk2AE0hDi9NSDJQjfpjOxadwkPYbU7uLR7MQOLbaBxmGEOOzGA76fzBLQ3EDRe5xJ5JOgvDIMd48eJCNhfAFA-og4aqcGISHzEjHYwWULuOxXdxmebzVE7M6GMzC8zzXaQ-lEkmxR4NJqtWAsACuLXwWRyJFgVHQVFyqoepA1zTauv1LNkClBHNAY2MTlc2hCOhIVkRgU8V2MCxVdzV1satu1evwJAA6uhqAAxOQtG2tNiYdk0j6OgbO9mjRDmKYhWXLLRaCzuOY6SXWXQkA4WHQXVbYszmMMxK0kDN22MJpNUVPpqOZ7PKA3xADyAFUAEJM-Ns6fFnYLaELeYBc42VYLBtYv3uRYbeYHQJtnuk9UTwf64cptMDrM51hsABy8VXhfXnKbvM27inul7LDoR5elKHokKKOj8kK8xiBYCq3hG-YPjGT6Ji+46ai077Tsw3x5pIwL-mCbresBPigbK4GHhK0FaMh3iHMENZiO4aw1tckTEuGfYDthca4aOr4PkRKjMAA0mQdQ8Cws7cMmZBfoyf5DAB1FASBu4MQekHMds1gTHBvgIfopj+t2AmWmSIn2nGTAyHQ1BUgw6gmmauToAAZuaLTIFoIRiEQDAOfeBGiSQrnuVQVJaS6G5ViEdFrKYjbtp6pkCr65y2OcKz8hc-G3L2jlYc5JDJgQuCwNgkBvlOMneaa5okAFQXIOFkVCVVMU1XVlCNc1UmtfgyVFoBrEKtMMx7kKtg4hYDaItChwoWIlhmDMXZ2OhwnVUOI0NU1EAtTm7W+V1gWtL1EVRZGQ2nfVY2XRN7IiFofROtpVEaDR+lgUZUGmWcPJeOKe27eK5WCZVjxdK0zleT5nXdQ9oUhE9A3IxSqOxtNOlAwg2JTAExjIZYdgrAcWiSntUw1heYrBL4h32fjCSEy0aM3Zj93BTjfXPeS9BEw6v0UQDrpk3YQp0ccRy1r4yHAZK5y+qs1YKusO3HEdZIjfQuAAF5gBwcg6ukhqEMaHUWjztUEGblvW7bEAk4DYy6AYRhWZY1hFbliBWDy+6QsiiLGHWCPi6b7kezb6TPhJLRCPkYD4FQtRMKaLRUF+YAAO6e3bADCTKcNw7DLkI3AcAuP4+-LYxCr6CJ7SYV42UzsqnusOgTGroWEtzSOkEnFtW6nEDp2OWc53ncgF+gRcl+X88MPSjLcN+s4sMkAJNy3v7kaylHtyWszNvyCHLIcgR7JKwGGMB9jGG2BhzBYCcuxninL2i80zL1zvnQuxcy4VwgOjJ2d0epi0AW7ZOc8QHiSXtnCBa8oFb1gW3DcqxoRXFbCGdYlxESM2gv-KYZ4oRmCvPoI43FjaPCAegtOTBsA6n8v5boiRMBFEXGAfyaYwAl3UFQLoDBq4Mg4HXNgDcz7zlbpff6KVZrCgsDCasphayeAcJeJmdgdEKjMsKLcMx9BsOnqg2esC4o8L4QIsAQiRFiJaBIsAUiZF7y+AfL8R8T4KObqoi+f0Cxy1Sv-HRVYTi2ARF4NYJlw7nHviEOYpj5geksLY12+B3acIXtw3h-CKhuOEaI8RkjpEUngbdLGIswp4yngUopjjSkuIqe46pXjaldEIbNWwvpWyWBrOYAI1hJSTChtiSYGxAgnFrBEAS+A5AQDgGoZ6stNG6QALTuElMYYwPgBS+AFKWfkeTJ53lIBQJQ9BdkzV0pMY5O1pgbD2MEZ+GwLD5OeNUeAV9omAX-g2WUcSlh7CxNZSYNjbkYScrGZ5pN3SikxGFHau5fDmElDMdioooRCgcFCPQ+TkU4RHGOK6pM1y+xLFWTFYUxSQQMGYBso8SBsQMdWBYVwzAUpOk+eKHlqiooZTsfwYheT+kyesbuRyWI1h5BcnEI9sQLHOEK16T4zofVpYDelN8pUBGmCsQ8pi8SHDWixVi3hVg2GWA4IUlwuYVTuZhXVcYvxyAEOIw1+BgUaJeWTdl3hR7AX5JCM4piIVil5AZcU8MDYALaSjfmKKQV7LJvNPE-J+QLAQpBayTMckkDpnyJYkwTk8XyRw2BEqTUwxhPowIZwDAnPrCxQ4zZO4TGDrMb+9b7HALTpgsB2DV7r03jA+eTaNxzG8Cc9Y7bITWW-jMwe6w9iMN8LHOmI7CloM6c48pgiqmeO8b4ikC6tFNmFG2RWwoyUzNMdMFawRjjViQoKxFfYG3zwlpSIFd7dKIiWBWoxcxazUxHqk8YFwYQR2sicc5KxVlhCAA */
      id,
      context: {
        deck: initDeck(),
        activePlayerId: "",
        players: initialPlayers,
        roundsPlayed: 0,
      },
      initial: "Initial",
      states: {
        Initial: {
          on: {
            START_GAME: {
              target: "DealHands",
              actions: ["shuffleDeck"],
            },
          },
        },

        DealHands: {
          entry: ["nextRound"],
          invoke: {
            id: "invokeDealHandsToPlayersAndDealer",
            src: "dealRound",
            input: ({ context }) => ({
              players: context.players,
            }),
            onDone: {
              target: "PlayersTurn",
              actions: assign({
                activePlayerId: ({ context }) => {
                  console.log({ player: context.players[0] })
                  return context.players[0].id
                },
              }),
            },
          },
          on: {
            HIT: {
              actions: "hitPlayer",
            },
          },
        },

        PlayersTurn: {
          entry: "setBlackjackHandsAsFinished",
          initial: "WaitForPlayerAction",
          states: {
            WaitForPlayerAction: {
              entry: enqueueActions(({ context }) => {
                const areAllFinished = context.players.every((player) =>
                  player.hands.every((hand) => hand.isFinished)
                )

                if (areAllFinished) {
                  return raise({ type: "END_ENCOUNTER" })
                }
              }),
              on: {
                HIT: {
                  guard: and(["isTurn", "canHit"]),
                  actions: ["hitPlayer", "nextPlayer"],
                },

                STAND: {
                  target: "FinishedPlayerAction",
                  actions: ["finishHand", "nextPlayer"],
                },

                END_ENCOUNTER: {
                  target: "NoMorePlayerActions",
                },
              },
            },

            FinishedPlayerAction: {
              always: [
                {
                  guard: "allPlayersAreFinished",
                  target: "NoMorePlayerActions",
                },
                {
                  target: "WaitForPlayerAction",
                },
              ],
            },
            NoMorePlayerActions: {
              type: "final",
            },
          },
          onDone: "FinalizeRound",
        },

        FinalizeRound: {
          entry: ["setPlayersRoundResult", "finalizePlayersBalance"],
          initial: "WaitForEventToStartNewRound",

          states: {
            WaitForEventToStartNewRound: {
              after: {
                0: {
                  target: "ShuffleDeckBeforeNextDeal",
                  guard: "shouldShuffleDeck",
                },
              },
              on: {
                CLEAR_TABLE_ROUND: {
                  actions: "clearForNewRound",
                },
                DEAL_ANOTHER_ROUND: {
                  actions: "clearForNewRound",
                  target: "DealHands",
                },
              },
            },
            ShuffleDeckBeforeNextDeal: {
              always: {
                target: "WaitForEventToStartNewRound",
              },
              on: {
                CLEAR_TABLE_ROUND: {
                  actions: "clearForNewRound",
                },
                DEAL_ANOTHER_ROUND: {
                  actions: ["clearForNewRound"],
                  target: "DealHands",
                },
              },
              exit: ["shuffleDeck"],
            },
            DealHands: {
              type: "final",
            },
          },
          onDone: "DealHands",
        },
      },

      types: {} as {
        events:
          | { type: "START_GAME" }
          | {
              type: "HIT"
              playerId: string
            }
          | {
              type: "STAND"
              playerId: string
            }
          | { type: "END_ENCOUNTER" }
          | { type: "DEAL_ANOTHER_ROUND" }
          | { type: "CLEAR_TABLE_ROUND" }
      },
    },
    {
      actions: {
        shuffleDeck: assign({
          deck: ({ context }) => shuffle(context.deck),
        }),
        nextRound: assign({
          roundsPlayed: ({ context }) => context.roundsPlayed + 1,
        }),
        finishHand: assign({
          players: ({ context }) => {
            const currentPlayer = getCurrentPlayer(context)
            return context.players.map((player) => {
              if (player.id !== currentPlayer.id) return player
              return {
                ...player,
                hands: player.hands.map((hand, idx) => {
                  if (idx !== player.hands.length - 1) return hand
                  return {
                    ...hand,
                    isFinished: true,
                  }
                }),
              }
            })
          },
        }),
        nextPlayer: assign({
          activePlayerId: ({ context, self }) => {
            // slice the array to move all players before the activePlayer to the end of the array
            const activePlayerIndex = context.players.findIndex(
              (player) => player.id === context.activePlayerId
            )

            const newPlayerOrder = context.players
              .slice(activePlayerIndex + 1)
              .concat(context.players.slice(0, activePlayerIndex + 1))
              .filter(
                (player) => !player.hands[player.hands.length - 1].isFinished
              )

            if (newPlayerOrder.length === 0) {
              self.send({ type: "END_ENCOUNTER" })
              return context.players[0].id
            }

            return newPlayerOrder[0].id
          },
        }),

        hitPlayer: assign(({ context, event }) => {
          if (!("playerId" in event)) {
            throw new Error("Event must have player ID")
          }

          const [topCard, ...deck] = context.deck

          return {
            deck,
            players: context.players.map((player) => {
              if (player.id !== event.playerId) return player
              return {
                ...player,
                hands: player.hands.map((hand, idx) => {
                  if (idx !== player.hands.length - 1) return hand
                  const newCards = hand.cards.concat(topCard)

                  return {
                    ...hand,
                    cards: newCards,
                    isFinished: getCardsValue(newCards) > 21,
                  }
                }),
              }
            }),
          }
        }),

        setPlayersRoundResult: assign({
          players: ({ context }) => {
            // Create a new array with updated roundResults
            return context.players.map((player) => {
              return {
                ...player,
                hands: player.hands.map((hand, index) => {
                  // Determine the highest non-bust score for this hand index
                  let highestNonBustScore = 0
                  context.players.forEach((p) => {
                    const score = getCardsValue(p.hands[index].cards)
                    if (score <= 21 && score > highestNonBustScore) {
                      highestNonBustScore = score
                    }
                  })

                  // Determine the roundResult for this hand
                  let roundResult = ""
                  if (getCardsValue(hand.cards) > 21) {
                    roundResult = "bust"
                  } else if (
                    getCardsValue(hand.cards) === highestNonBustScore
                  ) {
                    roundResult = "win"
                  } else {
                    roundResult = "lose"
                  }

                  return { ...hand, roundResult }
                }),
              }
            })
          },
        }),

        clearForNewRound: assign({
          players: ({ context }) =>
            context.players.map((player) => ({
              ...player,
              hands: [
                {
                  id: `Hand-0`,
                  cards: [],
                  isFinished: false,
                  roundResult: undefined as string | undefined,
                },
              ],
            })),
          activePlayerId: "",
        }),
      },
      actors: {
        dealRound: createMachine(
          {
            id: "dealRound",
            initial: "drawingRound",
            types: {} as {
              input: {
                players: Player[]
              }
            },
            context: ({ input }) => {
              return {
                players: input.players,
                currentPlayerIndex: 0,
                numberOfRounds: 2, // Example value, set this based on your game rules
                currentRound: 1,
              }
            },
            states: {
              drawingRound: {
                always: [
                  {
                    actions: ["drawCardForPlayer", "nextPlayer"],
                    target: "drawingRound",
                    guard: "isNotFinalPlayer",
                  },
                  {
                    actions: ["drawCardForPlayer"],
                    target: "checkRoundCompletion",
                  },
                ],
              },
              checkRoundCompletion: {
                always: [
                  {
                    target: "final",
                    guard: "isFinalRound",
                  },
                  {
                    target: "drawingRound",
                    actions: ["nextRound"],
                  },
                ],
              },
              final: {
                type: "final",
              },
            },
          },
          {
            actions: {
              drawCardForPlayer: ({ self, context }) => {
                self._parent?.send({
                  type: "HIT",
                  playerId: context.players[context.currentPlayerIndex].id,
                })
              },
              nextPlayer: assign({
                currentPlayerIndex: ({ context }) =>
                  context.currentPlayerIndex + 1,
              }),
              nextRound: assign({
                currentRound: ({ context }) => context.currentRound + 1,
                currentPlayerIndex: 0,
              }),
            },
            guards: {
              isNotFinalPlayer: ({ context }) => {
                return context.currentPlayerIndex < context.players.length - 1
              },
              isFinalRound: ({ context }) =>
                context.currentRound >= context.numberOfRounds,
            },
          }
        ),
      },
      guards: {
        isTurn: ({ context, event }) => {
          if (!("playerId" in event)) {
            throw new Error("Event must have player ID")
          }

          return context.activePlayerId === event.playerId
        },

        canHit: ({ context }) => {
          const currentPlayer = getCurrentPlayer(context)
          const hand = currentPlayer.hands[currentPlayer.hands.length - 1]
          return getCardsValue(hand.cards) < 21
        },

        allPlayersAreFinished: ({ context }) => {
          return context.players.every((player) =>
            player.hands.every((hand) => hand.isFinished)
          )
        },

        shouldShuffleDeck: ({ context }) => {
          const minCardsPerPlayer = 10

          return (
            context.deck.length <
            minCardsPerPlayer * (context.players.length + 1)
          )
        },
      },
    }
  )
}

export function getCardsValue(cards: Player["hands"][number]["cards"]) {
  return cards.reduce((sum, card) => {
    return sum + card.level
  }, 0)
}

function getCurrentPlayer({
  players,
  activePlayerId,
}: {
  players: Array<Player>
  activePlayerId: string
}) {
  const player = players.find((player) => player.id === activePlayerId)
  if (!player) throw new Error("Player not found")
  return player
}

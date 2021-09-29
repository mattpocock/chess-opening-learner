import { Grid, GridItem, Text, VStack } from "@chakra-ui/layout";
import { Input, Button } from "@chakra-ui/react";
import { createMachine } from "xstate";
import { createModel } from "xstate/lib/model";
import { Box, HStack } from "@chakra-ui/react";
import { ChessInstance, Square } from "chess.js";
import { useState } from "react";
import { Chessboard } from "react-chessboard";
import useSWR from "swr";
import { api } from "../lib/api";
import { useInterpret } from "@xstate/react";
import { useTextInput } from "../lib/useTextInput";

// const Chessboard = dynamic(() => import("react-chessboard").then(res => res.Chessboard), {
//   ssr: false,
// });

declare global {
  const Chess: typeof import("chess.js").Chess;
}

const model = createModel(
  {},
  {
    events: {
      LEFT_ARROW: () => ({}),
      RIGHT_ARROW: () => ({}),
    },
  },
);

const machine = model.createMachine(
  {
    on: {
      LEFT_ARROW: {
        actions: "goBackOneMove",
      },
      RIGHT_ARROW: {
        actions: "goForwardOneMove",
      },
    },
    invoke: {
      src: "listenForKeys",
    },
  },
  {
    services: {
      listenForKeys: () => (send) => {
        const listener = (e: KeyboardEvent) => {
          switch (e.key) {
            case "ArrowLeft": {
              send("LEFT_ARROW");
            }
            case "ArrowRight": {
              send("RIGHT_ARROW");
            }
          }
        };
        window.addEventListener("keydown", listener);

        return () => {
          window.removeEventListener("keydown", listener);
        };
      },
    },
  },
);

const HomePage = () => {
  const [game, setGame] = useState(new Chess());

  function safeGameMutate(modify: (game: ChessInstance) => void) {
    setGame((g: ChessInstance) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  const textInput = useTextInput();

  const service = useInterpret(machine, {
    actions: {
      goBackOneMove: () => {
        safeGameMutate((game) => {
          game.undo();
        });
      },
      goForwardOneMove: () => {
        // safeGameMutate((game) => game.board());
      },
    },
  });

  const getDatabaseQuery = useSWR(
    `database`,
    () => {
      return api.db.getDb();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  const lichessExplorerQuery = useSWR(
    `explorer_${game.fen()}`,
    () => {
      return api.lichess.getMasterGamesByFen(game.fen());
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  // const lichessCloudEvalQuery = useSWR(
  //   `cloud_eval_${game.fen()}`,
  //   () => {
  //     return api.lichess.getCloudEvalByFen(game.fen());
  //   },
  //   {
  //     revalidateOnFocus: false,
  //     revalidateOnReconnect: false,
  //     revalidateIfStale: false,
  //   },
  // );

  const cardsSearchQuery = useSWR(
    `cards_${textInput.throttledValue}`,
    () => {
      if (!textInput.throttledValue) {
        return undefined;
      }
      return api.mtg.searchForCard(textInput.throttledValue);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    let move = null;
    safeGameMutate((game) => {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });
    });

    if (move === null) {
      return false;
    }

    // setTimeout(makeRandomMove, 200);
    return true;
  }

  const cachedCard = getDatabaseQuery.data?.positions[game.ascii()]?.card;

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          expectingAlternateMoves={false}
        />
        <Box width="80" ml="4">
          {cachedCard && <img src={cachedCard.imageUrl} />}
          {!cachedCard && !getDatabaseQuery.isValidating && (
            <VStack>
              <Input {...textInput.inputProps} />
              <Grid templateColumns="repeat(2, 1fr)">
                {cardsSearchQuery.data?.cards.map((card) => {
                  return (
                    <GridItem key={card.id}>
                      <button
                        onClick={async () => {
                          getDatabaseQuery.mutate({
                            positions: {
                              ...getDatabaseQuery.data?.positions,
                              [game.ascii()]: {
                                card: card,
                              },
                            },
                          });
                          await api.db.setCardToAscii(game.ascii(), card);
                          textInput.setValue("");
                        }}
                      >
                        <img src={card.imageUrl}></img>
                      </button>
                    </GridItem>
                  );
                })}
              </Grid>
            </VStack>
          )}
        </Box>
      </Box>
      <VStack mt="4" spac>
        <Button
          onClick={() => {
            safeGameMutate((game) => game.reset());
          }}
        >
          Reset
        </Button>
        <Box>
          <Text>{lichessExplorerQuery.data?.opening?.name}</Text>
          <Text mb="4">{lichessExplorerQuery.data?.opening?.eco}</Text>
          {lichessExplorerQuery.data?.moves.map((move, index) => {
            return (
              <HStack key={index}>
                <Text fontSize="lg" fontWeight="bold" width="12">
                  {move.san}
                </Text>
                <Text>White: {move.white}</Text>
                <Text>Draws: {move.draws}</Text>
                <Text>Black: {move.black}</Text>
              </HStack>
            );
          })}
        </Box>
      </VStack>
    </>
  );
};

export default HomePage;

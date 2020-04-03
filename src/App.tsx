import React, { useState, useEffect, useRef } from "react";

const DISH_TYPES: DishName[] = [
  "plate",
  "bowl",
  "knife",
  "spoon",
  "fork",
  "pot",
  "pan",
  "glass",
  "wine glass"
];
type DishName =
  | "plate"
  | "bowl"
  | "knife"
  | "spoon"
  | "fork"
  | "pot"
  | "pan"
  | "glass"
  | "wine glass";

type Dish = { type: DishName; id: string };

function createDish(): Dish {
  return {
    type: DISH_TYPES[Math.floor(Math.random() * DISH_TYPES.length)],
    id: crypto.getRandomValues(new Uint32Array(10)).toString()
  };
}

// from overreacted.io
function useInterval(callback: Function, delay: number) {
  const savedCallback = useRef<Function>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current!();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const WASH_TIME = 5000;

export default function App() {
  const [error, setError] = useState<string | undefined>();
  const [dishes, setDishes] = useState<Dish[]>([createDish()]);
  const [hand, setHand] = useState<Dish | undefined>();
  const [sink, setSink] = useState<Dish | undefined>();
  const [canDry, setCanDry] = useState<boolean>(false);
  const [drying, setDrying] = useState<Dish[]>([]);
  const [cupboard, setCupboard] = useState<number>(0);

  // TODO: better formula, it converges too slowly now
  const speed = 5000 + 5000 / (Math.log(cupboard + 1) + 1);

  useInterval(() => {
    setDishes([...dishes, createDish()]);
  }, speed);

  useEffect(() => {
    if (sink) {
      setTimeout(() => {
        setCanDry(true);
      }, WASH_TIME);
    }
  }, [sink]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(undefined);
      }, 5000);
    }
  }, [error]);

  const pickUp = (dish: Dish, i: number) => () => {
    const newDishes = [...dishes.slice(0, i), ...dishes.slice(i + 1)];

    if (hand) {
      setDishes([...newDishes, hand]);
      setHand(dish);
    } else {
      setDishes(newDishes);
      setHand(dish);
    }
  };

  const moveToSink = (dish: Dish) => () => {
    if (!sink) {
      setHand(undefined);
      setSink(dish);
    } else {
      setError("wash the things in the sink first!");
    }
  };

  const moveToDry = (dish: Dish | undefined) => () => {
    if (dish && drying.length < 10) {
      setSink(undefined);
      setCanDry(false);
      setDrying([...drying, dish]);
    } else {
      setError("put away the dry dishes first!");
    }
  };

  const putAway = (i: number) => () => {
    setDrying([...drying.slice(0, i), ...drying.slice(i + 1)]);
    setCupboard(cupboard + 1);
  };

  return (
    <>
      <h1>Dish washing simulator</h1>
      <a href="https://github.com/bullgit/dirty-dishes">source</a>
      {error && <p>{error}</p>}
      <div className="flex">
        <section>
          <h2>Pile</h2>
          <ul>
            {dishes.map((dish, i) => (
              <li key={dish.id}>
                {dish.type} <button onClick={pickUp(dish, i)}>pick up</button>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Hand</h2>
          {hand && hand.type}{" "}
          {hand && <button onClick={moveToSink(hand)}>wash</button>}
        </section>
        <section>
          <h2>Sink</h2>
          {sink && sink.type}{" "}
          {canDry && <button onClick={moveToDry(sink)}>dry</button>}
        </section>
        <section>
          <h2>Drying rack</h2>
          <ul>
            {drying.map((dish, i) => (
              <li key={dish.id}>
                {dish.type} <button onClick={putAway(i)}>put away</button>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Cupboard</h2>
          <p>Put {cupboard} items away.</p>
        </section>
      </div>
    </>
  );
}

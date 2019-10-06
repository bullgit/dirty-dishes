import React, { useState, useEffect, useRef } from 'react';

const DISH_TYPES: Dish[] = [
  'plate',
  'bowl',
  'knife',
  'spoon',
  'fork',
  'pot',
  'pan',
  'glass',
  'wine glass',
];
type Dish =
  | 'plate'
  | 'bowl'
  | 'knife'
  | 'spoon'
  | 'fork'
  | 'pot'
  | 'pan'
  | 'glass'
  | 'wine glass';

function getRandomDish() {
  return DISH_TYPES[Math.floor(Math.random() * DISH_TYPES.length)];
}

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

export default function App() {
  const [error, setError] = useState<string | undefined>();
  const [dishes, setDishes] = useState<Dish[]>(['plate', 'bowl']);
  const [hand, setHand] = useState<Dish | undefined>();
  const [sink, setSink] = useState<Dish | undefined>();
  const [canDry, setCanDry] = useState<boolean>(false);
  const [drying, setDrying] = useState<Dish[]>(['plate', 'bowl']);

  useInterval(() => {
    setDishes([...dishes, getRandomDish()]);
  }, 5000);

  useEffect(() => {
    if (sink) {
      setTimeout(() => {
        setCanDry(true)
      }, 5000)
    }
  }, [sink])

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

  const putAway = (i: number) => () => {
    setDrying([...drying.slice(0, i), ...drying.slice(i + 1)]);
  };

  const moveToSink = (dish: Dish) => () => {
    if (!sink) {
      setHand(undefined);
      setSink(dish);
    } else {
      setError('wash the things in the sink first!');
    }
  };

  const moveToDry = (dish: Dish | undefined) => () => {
    if (dish) {
      setSink(undefined);
      setCanDry(false);
      setDrying([...drying, dish]);
    } else {
      setError('wash the things in the sink first!');
    }
  };

  return (
    <>
      <h1>Dish washing simulator</h1>
      {error && <p>{error}</p>}
      <section>
        <h2>Pile</h2>
        <ul>
          {dishes.map((dish, i) => (
            <li>
              {dish} <button onClick={pickUp(dish, i)}>pick up</button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Hand</h2>
        {hand} {hand && <button onClick={moveToSink(hand)}>wash</button>}
      </section>
      <section>
        <h2>Sink</h2>
        {sink} {canDry && <button onClick={moveToDry(sink)}>dry</button>}
      </section>
      <section>
        <h2>Drying rack</h2>
        <ul>
          {drying.map((dish, i) => (
            <li>
              {dish} <button onClick={putAway(i)}>put away</button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

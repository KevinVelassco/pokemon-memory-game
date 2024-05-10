import { computed, onMounted, ref } from 'vue';
import confetti from 'canvas-confetti';
import { pokemonApi } from '../api/pokemonApi';
import {
  GameDifficultyLevel,
  GameStatus,
  type GameSettings,
  type Pokemon,
  type PokemonListResponse,
} from '../interfaces';
import { generateUuid } from '@/helpers';

export const usePokemonMemoryGame = () => {
  const pokemons = ref<Pokemon[]>([]);
  const pokemonsForGame = ref<Pokemon[]>([]);
  const difficultyLevelOptions = ref<string[]>([]);
  const numberOfCorrectAnswers = ref(0);
  const gameDifficultyLevel = ref<GameDifficultyLevel>(GameDifficultyLevel.Easy);
  const gameStatus = ref<GameStatus>(GameStatus.Playing);
  const numberOfWinsWithoutLosing = ref(0);

  const gameSettings = computed<GameSettings>(() => {
    const pokemonBoard = {
      [GameDifficultyLevel.Easy]: {
        rows: 10,
        columns: 1,
        numberOfLives: 10,
        victoriesWithoutLosing: 1,
      },
      [GameDifficultyLevel.Normal]: {
        rows: 15,
        columns: 1,
        numberOfLives: 14,
        victoriesWithoutLosing: 1,
      },
      [GameDifficultyLevel.Hard]: {
        rows: 15,
        columns: 1,
        numberOfLives: 15,
        victoriesWithoutLosing: 2,
        blackImage: true,
      },
    };

    return pokemonBoard[gameDifficultyLevel.value];
  });

  const currentLives = ref(gameSettings.value.numberOfLives);

  const getPokemos = async (): Promise<Pokemon[]> => {
    const pokemonsWithSvg = 649;
    let limit = 100;

    const pages = Math.floor(pokemonsWithSvg / limit);

    const randomPage = Math.floor(Math.random() * pages);

    const offset = randomPage * limit;

    limit = randomPage === pages - 1 ? pokemonsWithSvg - offset : limit;

    const { data } = await pokemonApi.get<PokemonListResponse>(`/?limit=${limit}&offset=${offset}`);

    const pokemons = data.results.map((pokemon) => {
      const urlParts = pokemon.url?.split('/');
      //const pokemonId = +(urlParts.at(-2) ?? 0);
      const pokemonId = +(urlParts[urlParts.length - 2] ?? 0);

      return {
        id: pokemonId,
        name: pokemon.name,
      };
    });

    const randomPokemons = pokemons.sort(() => Math.random() - 0.5);

    return randomPokemons;
  };

  const getNextRound = () => {
    gameStatus.value = GameStatus.Playing;
    currentLives.value = gameSettings.value.numberOfLives;
    numberOfCorrectAnswers.value = 0;
    numberOfWinsWithoutLosing.value = 0;

    const randomStart = Math.floor(Math.random() * 60);

    const { rows, columns } = gameSettings.value;

    const amountOfPokemonToPlay = rows * columns;

    const selectedPokemons = pokemons.value
      .slice(randomStart, randomStart + amountOfPokemonToPlay)
      .map((pokemon) => ({
        ...pokemon,
        disabled: true,
        url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg`,
      }));

    pokemonsForGame.value = [...selectedPokemons, ...selectedPokemons]
      .sort(() => Math.random() - 0.5)
      .map((pokemon) => ({ ...pokemon, uid: generateUuid() }));
  };

  const changeGameDifficulty = (level: GameDifficultyLevel) => {
    gameDifficultyLevel.value = level;
    getNextRound();
  };

  const updateWinningPokemon = (selectedPokemons: [Pokemon, Pokemon]) => {
    const [firstPokemon, secondPokemon] = selectedPokemons;

    if (!(firstPokemon.id === secondPokemon.id && firstPokemon.uid !== secondPokemon.uid)) {
      if (currentLives.value >= 0) {
        currentLives.value--;
        numberOfWinsWithoutLosing.value = 0;
      }

      if (currentLives.value === 0) {
        gameStatus.value = GameStatus.Lost;
        return;
      }

      return;
    }

    pokemonsForGame.value = pokemonsForGame.value.map((pokemon) => {
      if (pokemon.id !== firstPokemon.id) return pokemon;

      numberOfCorrectAnswers.value++;

      return { ...pokemon, disabled: false };
    });

    const { victoriesWithoutLosing, numberOfLives } = gameSettings.value;

    if (currentLives.value < numberOfLives) numberOfWinsWithoutLosing.value++;

    if (victoriesWithoutLosing) {
      if (victoriesWithoutLosing === numberOfWinsWithoutLosing.value) {
        currentLives.value++;
        numberOfWinsWithoutLosing.value = 0;
      }
    }

    if (numberOfCorrectAnswers.value === pokemonsForGame.value.length) {
      gameStatus.value = GameStatus.Won;
      confetti({
        particleCount: 300,
        spread: 150,
        origin: { y: 0.6 },
      });
    }
  };

  onMounted(async () => {
    difficultyLevelOptions.value = Object.values(GameDifficultyLevel);
    pokemons.value = await getPokemos();
    getNextRound();
  });

  return {
    difficultyLevelOptions,
    pokemonsForGame,
    gameSettings,
    currentLives,
    gameStatus,
    gameDifficultyLevel,

    changeGameDifficulty,
    getNextRound,
    updateWinningPokemon,
  };
};

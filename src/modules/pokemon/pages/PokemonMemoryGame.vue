<template>
  <section v-if="false" class="flex flex-col justify-center items-center w-screen h-screen">
    <h1 class="text-3xl">Espere por favor</h1>
    <h3 class="animate-pulse">Cargando Pokémons</h3>
  </section>

  <section class="flex flex-col justify-center items-center w-screen h-screen">
    <PokemonLevelOptions
      :levelOptions="difficultyLevelOptions"
      :currentlevel="gameDifficultyLevel"
      @selected-option="changeGameDifficulty"
    />
    <PokemonMemory
      :pokemons="pokemonsForGame"
      :setting="gameSettings"
      :current-lives="currentLives"
      :status="gameStatus"
      @send-selected-pokemon="updateWinningPokemon"
    />

    <div class="m-5">
      <button
        class="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700 transition-all"
        v-if="gameStatus !== GameStatus.Playing"
        @click="getNextRound()"
      >
        Play again
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import PokemonLevelOptions from '../components/PokemonLevelOptions.vue';
import PokemonMemory from '../components/PokemonMemory.vue';
import { usePokemonMemoryGame } from '../composables/usePokemonMemoryGame';
import { GameStatus } from '../interfaces';

const {
  pokemonsForGame,
  difficultyLevelOptions,
  gameSettings,
  currentLives,
  gameStatus,
  gameDifficultyLevel,
  getNextRound,
  changeGameDifficulty,
  updateWinningPokemon,
} = usePokemonMemoryGame();
</script>

<style scoped></style>

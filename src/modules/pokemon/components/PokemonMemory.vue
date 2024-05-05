<template>
  <section>
    <div class="flex flex-row justify-end" v-if="status !== GameStatus.Lost">
      <IconHeart v-for="live in lives" :key="live.id" :style="`w-5 h-7 mb-3 ${live.color}`" />
    </div>

    <div v-if="status === GameStatus.Lost" class="w-[250px] h-[250px] flex justify-center">
      <img
        class="fade-in"
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/143.svg"
        alt="Perdiste"
      />
    </div>

    <div v-else class="grid grid-cols-5 gap-1.5">
      <div v-for="pokemon in pokemons" :key="pokemon.uid">
        <div
          v-if="!pokemon.disabled || showSelectedPokemon(pokemon.uid)"
          class="pokemon-image-container"
        >
          <img
            v-if="setting.blackImage && pokemon.disabled"
            class="fade-in brightness-0 w-[64px] h-[64px]"
            :src="pokemon.url"
          />
          <img v-else class="fade-in w-[64px] h-[64px]" :src="pokemon.url" />
        </div>
        <button
          v-else
          class="pokemon-container w-[64px] h-[64px]"
          :disabled="disablePokemons"
          @click="checkAnswer(pokemon)"
        ></button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { type GameSettings, GameStatus, type Pokemon } from '../interfaces';
import { sleep } from '@/helpers';
import IconHeart from '@/modules/shared/components/icons/IconHeart.vue';

interface Props {
  pokemons: Pokemon[];
  setting: GameSettings;
  currentLives: number;
  status: GameStatus;
}

const props = defineProps<Props>();

const numberOfTouches = ref(0);
const selectedPokemons = ref<Pokemon[]>([]);
const disablePokemons = ref(false);

const lives = computed(() => {
  return Array.from({ length: props.setting.numberOfLives }).map((_, index) => {
    const { numberOfLives } = props.setting;

    const i = numberOfLives - index;
    const hasLostlife = i > props.currentLives;

    return {
      id: i,
      hasLostlife,
      color: hasLostlife ? 'text-gray-300' : 'text-red-500',
    };
  });
});

const showSelectedPokemon = (uid: string | undefined) => {
  return selectedPokemons.value.some((pokemon) => pokemon.uid === uid);
};

const emits = defineEmits<{
  sendSelectedPokemon: [pokemos: [Pokemon, Pokemon]];
}>();

const checkAnswer = async (pokemon: Pokemon) => {
  if (numberOfTouches.value === 1) {
    const [firstPokemon] = selectedPokemons.value;
    if (firstPokemon.uid === pokemon.uid) return;
  }

  numberOfTouches.value++;

  if (numberOfTouches.value > 2) return;

  selectedPokemons.value.push(pokemon);

  if (selectedPokemons.value.length < 2) return;

  disablePokemons.value = true;

  const [firstPokemon, secondPokemon] = selectedPokemons.value;

  emits('sendSelectedPokemon', [firstPokemon, secondPokemon]);

  await sleep(1);

  numberOfTouches.value = 0;
  selectedPokemons.value = [];
  disablePokemons.value = false;
};
</script>

<style scoped>
div,
img {
  user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
}

.pokemon-container {
  background-color: #e0e0e0;
  border-radius: 4px;
}

.pokemon-image-container {
  background-color: #d5d5d5;
  border-radius: 4px;
}
</style>

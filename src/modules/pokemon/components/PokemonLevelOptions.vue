<template>
  <section class="mb-5">
    <button
      v-for="level in levelOptions"
      :key="level"
      @click="changeLevel(level)"
      :class="[
        'capitalize disabled:shadow-none disabled:bg-gray-300 disabled:hover:hover:bg-gray-300',
      ]"
      :disabled="level === currentlevel"
    >
      {{ level }}
    </button>
  </section>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2';
import { GameDifficultyLevel } from '../interfaces';

interface Props {
  levelOptions: string[];
  currentlevel: GameDifficultyLevel;
}

defineProps<Props>();

const emit = defineEmits<{
  selectedOption: [level: GameDifficultyLevel];
}>();

const changeLevel = (level: string) => {
  Swal.fire({
    title: 'Deseas cambiar de nivel?',
    text: 'Si aceptas se iniciará una nueva partida!',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    result.isConfirmed && emit('selectedOption', level as GameDifficultyLevel);
  });
};
</script>

<style scoped>
button {
  @apply bg-white shadow-md rounded-lg p-2 m-1 cursor-pointer w-28 text-center transition-all hover:bg-gray-100;
}
</style>

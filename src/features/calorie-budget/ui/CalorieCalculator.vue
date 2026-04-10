<script setup lang="ts">
import { useCalorieCalculator } from '../model/useCalorieCalculator';
import { useUserStore } from '@/entities/user/';
import { AppButton } from '@/shared/ui/button';
import { AppSelect } from '@/shared/ui/select';

const { form, errors, result, calculate, clearError } = useCalorieCalculator();

const userStore = useUserStore();

const activityOptions = [
  { value: 'sedentary', label: 'Сидячий (мало/нет тренировок)' },
  { value: 'light', label: 'Лёгкая (1–3 раза/неделю)' },
  { value: 'moderate', label: 'Средняя (3–5 раз/неделю)' },
  { value: 'active', label: 'Высокая (6–7 раз/неделю)' },
  { value: 'very_active', label: 'Очень высокая (физ. труд / 2x)' },
];

const save = async () => {
  await userStore.setCalorieBudget(result.value?.targetCalories || 0);
};
</script>

<template>
  <div class="calorie-calc">
    <form @submit.prevent="calculate" class="calorie-calc__form">
      <h1>Рассчитайте суточную норму калорий</h1>
      <fieldset class="calorie-calc__group">
        <legend>Пол</legend>
        <label>
          <input type="radio" name="gender" value="male" v-model="form.gender" /> Мужской
        </label>
        <label>
          <input type="radio" name="gender" value="female" v-model="form.gender" /> Женский
        </label>
      </fieldset>
      <div class="calorie-calc__inputs">
        <div class="calorie-calc__field">
          <label for="age">Возраст</label>
          <input
            id="age"
            type="number"
            placeholder="35"
            v-model="form.age"
            @input="clearError('age')"
          />
          <span v-if="errors.age" class="calorie-calc__error">{{ errors.age }}</span>
        </div>
        <div class="calorie-calc__field">
          <label for="weight">Вес (кг)</label>
          <input
            id="weight"
            type="number"
            placeholder="70"
            v-model="form.weight"
            @input="clearError('weight')"
          />
          <span v-if="errors.weight" class="calorie-calc__error">{{ errors.weight }}</span>
        </div>
        <div class="calorie-calc__field">
          <label for="height">Рост (см)</label>
          <input
            id="height"
            type="number"
            placeholder="175"
            v-model="form.height"
            @input="clearError('height')"
          />
          <span v-if="errors.height" class="calorie-calc__error">{{ errors.height }}</span>
        </div>
      </div>
      <div class="calorie-calc__field">
        <label for="activity">Уровень активности</label>
        <AppSelect
          id="activity"
          name="activity"
          :options="activityOptions"
          v-model="form.activityLevel"
        />
      </div>
      <fieldset class="calorie-calc__group">
        <legend>Цель</legend>
        <label>
          <input type="radio" name="goal" value="lose" v-model="form.goal" /> Похудение
        </label>
        <label>
          <input type="radio" name="goal" value="maintain" v-model="form.goal" /> Поддержание
        </label>
        <label>
          <input type="radio" name="goal" value="gain" v-model="form.goal" /> Набор массы
        </label>
      </fieldset>
      <AppButton type="submit">Рассчитать норму</AppButton>
    </form>
    <div v-if="result" class="calorie-calc__result">
      <h2>Ваша суточная норма</h2>
      <p>
        Базовый обмен (BMR): <strong>{{ result.bmr }}</strong> ккал
      </p>
      <p>
        Расход с активностью (TDEE): <strong>{{ result.tdee }}</strong> ккал
      </p>
      <p class="calorie-calc__target">
        🎯 Цель: <strong>{{ result.targetCalories }}</strong> ккал/день
      </p>
      <p>
        <template v-if="result.dailyDeficitOrSurplus < 0">
          📉 Дефицит: {{ Math.abs(result.dailyDeficitOrSurplus) }} ккал
        </template>
        <template v-else-if="result.dailyDeficitOrSurplus > 0">
          📈 Профицит: +{{ result.dailyDeficitOrSurplus }} ккал
        </template>
        <template v-else> ⚖️ Без изменений </template>
      </p>
      <p
        v-if="result.targetCalories <= 1200 && form.gender === 'female'"
        class="calorie-calc__warning"
      >
        ⚠️ Обратите внимание: рацион ниже 1200 ккал не рекомендуется без наблюдения врача.
      </p>
      <AppButton color="rgb(var(--color-primary))" @click="save">Сохранить</AppButton>
    </div>
  </div>
</template>

<style scoped>
.calorie-calc {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (min-width: 768px) {
  .calorie-calc {
    flex-direction: row;
    gap: 3rem;
  }
}
.calorie-calc__form {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.calorie-calc__inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.calorie-calc__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.calorie-calc__error {
  color: rgb(var(--color-red));
  font-size: 0.85em;
  min-height: 1.2em;
}
.calorie-calc__result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}
.calorie-calc__target {
  font-size: 1.2em;
  color: #2f855a;
  margin: 8px 0;
}
.calorie-calc__warning {
  color: #d69e2e;
  font-size: 0.9em;
  margin-top: 8px;
}
fieldset {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px;
}
legend {
  padding: 0 5px;
  font-weight: 600;
}
label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
input[type='number'],
select {
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}
h1,
h2 {
  font-size: 24px;
}
</style>

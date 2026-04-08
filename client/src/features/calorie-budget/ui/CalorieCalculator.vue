<script setup lang="ts">
import { AppButton } from '@/shared/ui/button';
import { useCalorieCalculator } from '../model/useCalorieCalculator';

const { form, errors, result, calculate, clearError } = useCalorieCalculator();

const emit = defineEmits(['calculated']);

const passResult = () => {
  calculate();
  emit('calculated', result.value?.targetCalories || 0);
};
</script>

<template>
  <div class="calorie-calc">
    <form @submit.prevent="passResult" class="calorie-calc__form">
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
        <select id="activity" v-model="form.activityLevel">
          <option value="sedentary">Сидячий (мало/нет тренировок)</option>
          <option value="light">Лёгкая (1–3 раза/неделю)</option>
          <option value="moderate">Средняя (3–5 раз/неделю)</option>
          <option value="active">Высокая (6–7 раз/неделю)</option>
          <option value="very_active">Очень высокая (физ. труд / 2x тренировки)</option>
        </select>
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
      <h3>Ваша суточная норма</h3>
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
    </div>
  </div>
</template>

<style scoped>
.calorie-calc {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
.calorie-calc__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  margin-top: 20px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
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
</style>

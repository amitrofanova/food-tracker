<script setup lang="ts">
import { useCalorieCalculator } from '../model/useCalorieCalculator';
import { useUserStore } from '@/entities/user/';
import { AppButton } from '@/shared/ui/button';
import { AppSelect } from '@/shared/ui/select';
import { AppInput } from '@/shared/ui/input';

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

// Minimum selectable date: MIN_GOAL_DAYS from today, formatted as YYYY-MM-DD
const minTargetDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
});
</script>

<template>
  <div class="calorie-calc">
    <form @submit.prevent="calculate" class="calorie-calc__form">
      <!-- <h1 class="calorie-calc__header">Рассчитайте суточную норму калорий</h1> -->
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
        <AppInput
          label="Возраст"
          type="number"
          placeholder="35"
          v-model="form.age"
          :error="errors.age"
          @input="clearError('age')"
        />
        <AppInput
          label="Вес (кг)"
          type="number"
          placeholder="70"
          v-model="form.weight"
          :error="errors.weight"
          @input="clearError('weight')"
        />
        <AppInput
          label="Рост (см)"
          type="number"
          placeholder="175"
          v-model="form.height"
          :error="errors.height"
          @input="clearError('height')"
        />
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
      <template v-if="form.goal !== 'maintain'">
        <AppInput
          :label="form.goal === 'lose' ? 'Целевой вес (кг)' : 'Желаемый вес (кг)'"
          type="number"
          :placeholder="form.goal === 'lose' ? '65' : '80'"
          v-model="form.targetWeight"
          :error="errors.targetWeight"
          @input="clearError('targetWeight')"
        />
        <AppInput
          label="Желаемая дата"
          type="date"
          :min="minTargetDate"
          v-model="form.targetDate"
          :error="errors.targetDate"
          @input="clearError('targetDate')"
        />
      </template>
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

      <template v-if="result.dailyDeficitOrSurplus !== 0">
        <p v-if="result.dailyDeficitOrSurplus < 0">
          📉 Дефицит: <strong>{{ Math.abs(result.dailyDeficitOrSurplus) }}</strong> ккал/день
        </p>
        <p v-else>
          📈 Профицит: <strong>+{{ result.dailyDeficitOrSurplus }}</strong> ккал/день
        </p>
        <p>
          ⚖️ Темп: вес будет
          <strong
            >{{ result.weeklyWeightChange > 0 ? '+' : ''
            }}{{ result.weeklyWeightChange }} кг</strong
          >
          / неделю
        </p>
        <p v-if="result.daysToGoal">
          📅 До цели: <strong>~{{ Math.round(result.daysToGoal / 7) }} недель</strong>
        </p>
        <p v-if="result.wasAdjusted" class="calorie-calc__warning">
          ⚠️ Ваша дата слишком агрессивна. При безопасном темпе цель достижима к {{
            result.adjustedTargetDate
          }}.
        </p>
      </template>
      <template v-else>
        <p>⚖️ Без изменений в весе</p>
      </template>

      <p
        v-if="result.targetCalories <= 1200 && form.gender === 'female'"
        class="calorie-calc__warning"
      >
        ⚠️ Рацион ниже 1200 ккал не рекомендуется без наблюдения врача.
      </p>
      <AppButton color="rgb(var(--color-darkgreen))" @click="save">Сохранить</AppButton>
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
@media (max-width: 767px) {
  .calorie-calc__form {
    padding-bottom: 50px;
  }
  .calorie-calc__header {
    font-size: 20px;
  }
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
h1,
h2 {
  font-size: 24px;
}
</style>

<template>
  <div
    class="atm-view d-flex align-items-center justify-content-center flex-column"
  >
    <h1>{{ user.resultSum ? "Confirmation" : "ATM Page" }}</h1>
    <h3 v-if="!user.resultSum" class="mt-2 mb-4">
      Total sum available: {{ totalSumAvailable }}
    </h3>
    <h3 v-else class="mt-2 mb-4">Your sum: {{ user.resultSum }}</h3>
    <div class="atm-view__notes mx-auto my-0">
      <div
        v-for="(value, key) in computedNotesList"
        :key="key"
        class="atm-view__notes-count d-flex align-items-center justify-content-between p-2"
      >
        <span>{{ key }} UAH</span>
        <span>{{ value }} notes</span>
      </div>
    </div>
    <div
      v-if="!user.resultSum"
      class="atm-view__input-block my-4 d-flex flex-column"
    >
      <cleave
        class="atm-view__input p-2"
        placeholder="Sum you want to get"
        :options="cleaveOptions"
        :value="validInputSum"
        :disabled="!totalSumAvailable"
        @input="updateUserSum"
      />
      <button
        class="btn atm-view__btn p-2 mt-3"
        :disabled="!totalSumAvailable"
        @click="submitSum"
      >
        Get money
      </button>
    </div>
    <div v-if="!user.resultSum">
      <h3 v-if="!sumError && totalSumAvailable">
        {{ inputSum || "Please, input sum" }}
      </h3>
      <h3 v-else-if="!sumError">Sorry, no money left</h3>
      <h3 v-else class="atm-view__error-message">Please, input another sum</h3>
    </div>
    <div v-else>
      <h3 class="mt-4">Operation Successful</h3>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data: () => ({
    inputSum: "",
    sumError: false,
    cleaveOptions: null,

    user: {
      resultSum: 0,
      resultNotes: null
    }
  }),

  beforeMount() {
    this.cleaveOptions = {
      numeral: true,
      numeralDecimalMark: ",",
      delimiter: " "
    };
  },

  computed: {
    ...mapGetters({
      notesLimits: "atmStore/NOTES_LIMITS",
      totalSumAvailable: "atmStore/ATM_TOTAL_SUM"
    }),

    computedNotesList() {
      return this.user.resultNotes || this.notesLimits;
    },

    validInputSum() {
      if (+this.inputSum > this.totalSumAvailable) {
        return this.totalSumAvailable;
      }
      if (+this.inputSum < 0) {
        return 0;
      }
      return this.inputSum;
    }
  },

  methods: {
    updateUserSum(inputSum) {
      this.sumError = false;
      this.inputSum = inputSum;
    },

    getMoney(amount, limits) {
      let recur = (amount, nominals) => {
        if (!amount) return {};
        if (!nominals.length) return;
        let nominal = nominals[0];
        let count = Math.min(limits[nominal], Math.floor(amount / nominal));
        for (let i = count; i >= 0; i--) {
          let result = recur(amount - i * nominal, nominals.slice(1));
          if (result) {
            return i ? { [nominal]: i, ...result } : result;
          }
        }
      };
      return recur(
        amount,
        Object.keys(limits)
          .map(Number)
          .sort((a, b) => b - a)
      );
    },

    getSumFromNotes(notes) {
      let resultSum = 0;
      for (const [key, value] of Object.entries(notes)) {
        resultSum += key * value;
      }
      return resultSum;
    },

    submitSum() {
      if (!+this.validInputSum) {
        this.sumError = true;
        return;
      }
      const result = this.getMoney(this.validInputSum, this.notesLimits);
      if (!result) {
        this.sumError = true;
        return;
      }
      for (const [key, value] of Object.entries(result)) {
        this.$store.commit("atmStore/UPDATE_ATM_BALANCE", {
          note: key,
          count: value
        });
      }
      this.showResult(result);
    },

    showResult(result) {
      this.user.resultNotes = result;
      this.user.resultSum = this.getSumFromNotes(result);
      this.inputSum = "";
      setTimeout(() => {
        this.user.resultNotes = null;
        this.user.resultSum = 0;
      }, 4000);
    }
  }
};
</script>

<style lang="scss" scoped>
.atm-view {
  margin-top: -40px;
  height: 100vh;
}

.atm-view__notes {
  width: 300px;
}

.atm-view__notes-count {
  background-color: #efefef;
}

.atm-view__input-block {
  width: 300px;
}

.atm-view__input {
  border: 1px solid #e2e2e2;
  border-radius: 0.42rem;
}

.atm-view__btn {
  border-radius: 0.42rem;
  background-color: #42b983;
  color: white;

  &:hover {
    color: white;
  }

  &:disabled {
    color: black;
    background-color: #e2e2e2;
  }
}

.atm-view__error-message {
  color: tomato;
}
</style>

export default {
  namespaced: true,
  state: {
    notesLimits: {
      10: 20,
      20: 20,
      50: 20,
      100: 20,
      200: 20,
      500: 20
    }
  },

  getters: {
    NOTES_LIMITS(state) {
      return state.notesLimits;
    },

    ATM_TOTAL_SUM(state) {
      let resultSum = 0;
      for (const [key, value] of Object.entries(state.notesLimits)) {
        resultSum += key * value;
      }
      return resultSum;
    }
  },

  mutations: {
    UPDATE_ATM_BALANCE(state, { note, count }) {
      state.notesLimits[note] -= count;
    }
  },

  actions: {}
};

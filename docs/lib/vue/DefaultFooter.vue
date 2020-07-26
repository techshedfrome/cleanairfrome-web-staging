<template>
        <div class="advice-box reading-bare is-mobile has-background-warning-light">
          <div class="has-text-centered">
            <div>
              <div class="title is-size-6 mb-3 has-text-centered has-text-weight-semibold">
                Accompanying health messages
                for at-risk individuals
              </div>
              {{ getAdvice }}
            </div>
          </div>
        </div>
</template>

<script>
export default {
  name: "DefaultFooter",
  props: {
  },
  computed: {
    getAdvice() {
      return "Coming Soon";
    },
  }
};
</script>

<style scoped>

</style>
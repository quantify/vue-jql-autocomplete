<script>
import JqlInput from "./components/JqlInput"

export default {
  name: "App",
  data() {
    return {
      value: ""
    }
  },
  components: {
    JqlInput
  },
  methods: {
    getAutocomplete() {
      return Promise.resolve({})
    },
    getSuggestions() {
      return Promise.resolve({
        results: [
          { value: "Bug", displayName: "Bug" },
          { value: "Epic", displayName: "Epic" },
          { value: "Story", displayName: "Story" },
          { value: "Sub-task", displayName: "Sub-task" },
          { value: "Task", displayName: "Task" }
        ]
      })
    }
  }
}
</script>

<template>
  <div>
    <h1>Vue JQL Autocomplete</h1>
    <jql-input v-model="value" :getAutocomplete="getAutocomplete" :getSuggestions="getSuggestions" placeholder="Enter query here..." />
  </div>
</template>

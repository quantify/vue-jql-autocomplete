<script>
import Input from "./Input"
import autocomplete from "../utils/autocomplete"

export default {
  name: "JqlInput",
  components: {
    Input
  },
  props: {
    getAutocomplete: {
      type: Function,
      required: true
    },
    getSuggestions: {
      type: Function,
      required: true
    },
    placeholder: {
      type: String,
      required: false
    },
    value: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      suggestions: []
    }
  },
  methods: {
    getSuggestionsData(fieldName, onSuccess, fieldValue) {
      return this.getSuggestions({ name: fieldName, value: fieldValue })
        .then(({ results }) => onSuccess(results))
    },
    setSuggestions(payload) {
      this.suggestions = payload
    },
    handleSelect(value) {
      this.setSuggestion(value, value => this.$emit("input", value))
    },
    handleInput(value) {
      this.$emit("input", value)
    }
  },
  mounted() {
    const { passAutocompleteData, onHintClicked } = autocomplete({
      inputId: "jql-input",
      render: this.setSuggestions,
      getSuggestions: this.getSuggestionsData
    })
    this.setSuggestion = onHintClicked
    this.passAutocompleteData = passAutocompleteData
    this.getAutocomplete().then(passAutocompleteData)
  }
}
</script>

<template>
  <Input
    :value="value"
    @input="handleInput"
    @select="handleSelect"
    :suggestions="suggestions"
    :placeholder="placeholder"
  />
</template>

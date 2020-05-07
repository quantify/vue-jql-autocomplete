<script>
import { mixin as clickaway } from "vue-clickaway"

export default {
  data() {
    return {
      current: 0,
      open: false,
      selection: ""
    }
  },
  mixins: [
    clickaway
  ],
  props: {
    suggestions: {
      type: Array,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: false
    }
  },
  watch: {
    value(value) {
      this.selection = value
    },
    suggestionsLength(value) {
      if (this.current > value) this.current = 0
    },
    suggestions(value) {
      this.$emit("input", this.selection)
    }
  },
  computed: {
    suggestionsLength() {
      return this.suggestions.length - 1
    }
  },
  methods: {
    handleEnter() {
      this.$emit("select", this.suggestions[this.current].value)
    },
    navigateUp(event) {
      event.preventDefault()
      if (this.current > 0) { this.current-- }
    },
    navigateDown(event) {
      event.preventDefault()
      if (this.current < this.suggestions.length - 1) { this.current++ }
    },
    isActive(index) {
      return index === this.current
    },
    handleChange(event) {
      if (!this.open) {
        this.open = true
        this.current = 0
      }
    },
    suggestionClick(index) {
      this.$emit("select", this.suggestions[index].value)
    },
    setSuggestion(index) {
      this.current = index
    },
    handleBlur() {
      if (this.open) this.open = false
    },
    handleFocus() {
      this.open = true
    }
  }
}
</script>

<template>
  <div class="autocomplete" v-on-clickaway="handleBlur">
    <input
      id="jql-input"
      autocomplete="off"
      v-model="selection"
      @focus="handleFocus"
      @input="handleChange"
      @keydown.up="navigateUp"
      :placeholder="placeholder"
      class="autocomplete__input"
      @keydown.down="navigateDown"
      @keydown.enter="handleEnter"
    />
    <div class="autocomplete__suggestions" :style="{ display: open ? 'block' : 'none' }">
      <ul class="autocomplete__list">
        <li
          @click="suggestionClick(index)"
          @mouseover="setSuggestion(index)"
          :key="`${suggestion.value}-${index}`"
          v-for="(suggestion, index) in suggestions"
          :class="['autocomplete__list-item', isActive(index) && 'autocomplete__list-item--active']"
        >
          {{ suggestion.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.autocomplete {
  position: relative;
}
.autocomplete__input {
  width: 100%;
  height: 32px;
  outline: none;
  font-size: 14px;
  padding: 4px 32px;
  border-radius: 4px;
  box-sizing: border-box;
  background: transparent;
  color: rgba(0,0,0,.65);
  border: 1px solid #d9d9d9;
}
.autocomplete__input:focus {
  border-color: #40a9ff;
  border-right-width: 1px !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
.autocomplete__suggestions {
  left: 0;
  top: 32px;
  z-index: 2;
  width: 100%;
  padding: 4px 0;
  margin-top: 10px;
  overflow: hidden;
  max-height: 400px;
  position: absolute;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.autocomplete__list {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 400px;
  overflow-y: scroll;
  padding-bottom: 10px;
  box-sizing: border-box;
}
.autocomplete__list-item {
  cursor: pointer;
  font-size: 14px;
  padding: 5px 12px;
  line-height: 22px;
  color: rgba(0,0,0,.65);
}
.autocomplete__list-item:last-child {
  border-bottom: none;
}
.autocomplete__list-item--active {
  background-color: #E6F7FF;
}
</style>

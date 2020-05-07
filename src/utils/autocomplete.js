const KeyCode = { LEFT_ARROW: 37, RIGHT_ARROW: 39 }
const KEYWORDS = [
  { value: "and", display: "AND" },
  { value: "or", display: "OR" },
  { value: "order-by", display: "ORDER BY" }
]
const OPERATORS = [
  { value: "=", display: "=" },
  { value: "!=", display: "!=" },
  { value: "<=", display: "<=" },
  { value: ">=", display: ">=" },
  { value: "<", display: "<" },
  { value: ">", display: ">" },
  { value: "~", display: "~" },
  { value: "!~", display: "!~" },
  { value: "is", display: "is" },
  { value: "is-not", display: "is not" },
  { value: "in", display: "in" },
  { value: "not-in", display: "not in" },
  { value: "was", display: "was" },
  { value: "was-in", display: "was in" },
  { value: "was-not", display: "was not" },
  { value: "was-not-in", display: "was not in" },
  { value: "changed", display: "changed" }
]
const OPERATORS_FOR_EMPTY = [
  "is",
  "is-not",
  "in",
  "was",
  "not-in",
  "was-not",
  "was-not-in",
  "changed"
]
const FOR_SEPARATION = ["=", "<", ">", "!", "~"]
const ORDER_BY_OPTS = [
  { value: "asc", display: "ASC" },
  { value: "desc", display: "DESC" }
]
const KEYWORDS_FOR_CHANGED = [
  "after",
  "before",
  "by",
  "during",
  "on",
  "from",
  "to"
]
const TIME_KEYWORDS = ["after", "before", "during", "on"]

function JQLAutocomplete({ inputId, getSuggestions, render }) {
  const input = document.getElementById(inputId)

  let changed = false

  let fields = []
  let functions = []

  let currentField
  let currentFieldValue
  let currentOperator

  let i
  let indexOfOperator
  let open = 0
  let close = 0

  let suggestions = []

  function sorter(a, b) {
    return a.length - b.length
  }

  function isLetter(str) {
    return str.match(/[a-z]/i) || str === "\""
  }

  function toSeparate(str) {
    return FOR_SEPARATION.indexOf(str) !== -1
  }

  function separateOperators(text) {
    for (i = 1; i < text.length; i++) {
      if (
        (toSeparate(text[i]) && isLetter(text[i - 1])) ||
        (isLetter(text[i]) && toSeparate(text[i - 1]))
      ) {
        text = text.substring(0, i) + " " + text.substring(i++)
      }
    }
    return text
  }

  function matchField(word) {
    if (word.startsWith("not-")) {
      word = word.substring(4)
    }
    for (const i in fields) {
      if (fields[i].copy === word || fields[i].displayNameCopy === word) {
        return i
      }
    }
    return null
  }

  function handleSuggestions(restSuggestions) {
    if (changed) return
    for (const i in restSuggestions) {
      addSuggestion(restSuggestions[i].displayName, restSuggestions[i].value)
    }
    render(suggestions)
  }

  function isKeyword(word) {
    for (const i in KEYWORDS) {
      if (KEYWORDS[i].value === word) {
        return true
      }
    }
    return false
  }

  function isOperator(word) {
    word = word.replace(/ /g, "-")
    let ops = []

    if (currentField) {
      ops = fields[currentField].operatorsCopy
    } else {
      for (const i in OPERATORS) {
        ops.push(OPERATORS[i].value)
      }
    }

    return ops.indexOf(word) !== -1
  }

  function isChangedOperator(word) {
    return KEYWORDS_FOR_CHANGED.indexOf(word) !== -1
  }

  function isTimeOperator(word) {
    return TIME_KEYWORDS.indexOf(word) !== -1
  }

  function isEmptyOperator(word) {
    return OPERATORS_FOR_EMPTY.indexOf(word) !== -1
  }

  function addSuggestion(text, value) {
    suggestions.push({ text, value })
    return true
  }

  function autocompleteField(prefix, orderBy) {
    if (prefix.startsWith("not-")) {
      prefix = prefix.substring(4)
    }

    for (const i in fields) {
      if (
        fields[i].copy.startsWith(prefix) ||
        fields[i].displayNameCopy.startsWith(prefix)
      ) {
        if (orderBy && !fields[i].orderable) continue
        if (!addSuggestion(fields[i].displayName, fields[i].value)) return
      }
    }
  }

  function autocompleteOperator(prefix) {
    let ops = []
    let copy = []

    if (currentField) {
      ops = fields[currentField].operators
      copy = fields[currentField].operatorsCopy
    } else {
      for (i in OPERATORS) {
        ops.push(OPERATORS[i].display)
        copy.push(OPERATORS[i].value)
      }
    }

    for (i in ops) {
      if (copy[i].startsWith(prefix)) {
        if (!addSuggestion(ops[i], ops[i])) return
      }
    }
  }

  function autocompleteKeyword(prefix) {
    for (const i in KEYWORDS) {
      if (KEYWORDS[i].value.startsWith(prefix)) {
        if (!addSuggestion(KEYWORDS[i].display, KEYWORDS[i].display)) return
      }
    }
  }

  function autocompleteValue(prefix, type) {
    if (!type && isEmptyOperator(currentOperator)) {
      if ("empty".startsWith(prefix)) addSuggestion("EMPTY", "EMPTY")
      if (currentOperator === "is" || currentOperator === "is-not") return
    }

    let types

    if (type) {
      if (type === "user") types = ["com.atlassian.jira.user.ApplicationUser"]
      else if (type === "time") types = ["java.util.Date"]
    } else if (currentField) {
      types = fields[currentField].types
    } else return

    for (const i in functions) {
      const f = functions[i]
      if (f.types[0] === "java.lang.String") continue
      if (types.indexOf(f.types[0]) === -1) continue
      if (f.copy.startsWith(prefix) || f.displayNameCopy.startsWith(prefix)) {
        if (!addSuggestion(f.displayName, f.value)) return
      }
    }

    if (type || !getSuggestions) return

    changed = false

    getSuggestions(currentFieldValue, handleSuggestions, prefix)
  }

  function autocompleteChangedKeyword(prefix) {
    for (const i in KEYWORDS_FOR_CHANGED) {
      const keyword = KEYWORDS_FOR_CHANGED[i]
      if (keyword.startsWith(prefix)) {
        if (!addSuggestion(keyword.toUpperCase(), keyword.toUpperCase())) { return }
      }
    }
  }

  function autocompleteOrderBy(prefix) {
    for (const i in ORDER_BY_OPTS) {
      const opt = ORDER_BY_OPTS[i]
      if (opt.value.startsWith(prefix)) {
        if (!addSuggestion(opt.display, opt.display)) return
      }
    }
  }

  function autocompleteNot(prefix) {
    const value = "not"
    const display = "NOT"
    if (value.startsWith(prefix)) {
      addSuggestion(display, display)
    }
  }

  function autocompleteOpenArray() {
    addSuggestion("open array", "(")
  }

  function autocompleteCloseArray() {
    addSuggestion("close array", ")")
  }

  function autocompleteComma() {
    addSuggestion("comma", ",")
  }

  function preprocessText(text) {
    text = text.toLowerCase()
    const fullCopy = text
    const lastChar = text.slice(-1)

    text = text.replace(/\(|\)/g, " ")
    text = text.replace(/,/g, " ")
    text = separateOperators(text)

    const spacesCopy = text
    text = text.replace(/\s\s+/g, " ")

    let last = -1
    let ans = ""
    for (i = 0; i < text.length; i++) {
      if (text[i] !== "\"") {
        continue
      }

      let end = i + 1
      while (end < text.length && text[end] !== "\"") {
        end++
      }

      ans +=
        text.substring(last, i) + text.substring(i, end).replace(/ /g, "-")
      last = end
      i = end + 1
    }
    ans += text.substring(last)
    text = ans

    text = text.replace(/\s\s+/g, " ")
    if (text[0] === " ") text = text.substring(1)

    text = text.replace(" order ", " order-")

    return {
      text: text,
      fullCopy: fullCopy,
      lastChar: lastChar,
      spacesCopy: spacesCopy
    }
  }

  function onHintClicked(toInsert, setValue) {
    const selStart = input.selectionStart

    let text = input.value.substring(0, selStart)
    const rest = input.value.substring(selStart)

    text = separateOperators(text)

    let cnt = 0
    let last
    let preLast
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\"") {
        cnt++
        preLast = last
        last = i
      }
    }

    let index = text.length - 1

    if (isOperator(toInsert)) {
      const copy = text
        .toLowerCase()
        .replace(/\(|\)/g, " ")
        .replace(/\s\s+/g, " ")
      let suffix = toInsert.length
      while (
        suffix >= 0 &&
        copy.endsWith(toInsert.substring(0, suffix)) === false
      ) { suffix-- }
      let spaces = toInsert.substring(0, suffix).split(" ").length - 1

      while (true) {
        if (text[index] === " ") {
          if (spaces <= 0) break
          spaces--
          while (index >= 0 && text[index] === " ") index--
        } else index--
      }
    } else if (toInsert !== ")") {
      if ((cnt & 1) === 1) {
        index = last - 1
      } else if (text.slice(-1) === "\"") {
        index = preLast - 1
      } else {
        while (
          index >= 0 &&
          text[index] !== " " &&
          text[index] !== "(" &&
          text[index] !== ")"
        ) { index-- }
      }
    }

    setValue(`${text.substring(0, index + 1)}${toInsert} ${rest}`)

    triggetInputEvent(input)

    input.focus()
    const finalLength = input.value.length - rest.length
    input.selectionStart = finalLength
    input.selectionEnd = finalLength
  }

  function handleInputChange() {
    suggestions = []
    changed = true

    const selStart = input.selectionStart
    const selEnd = input.selectionEnd

    if (selStart !== selEnd) {
      render(suggestions)
      return
    }

    let text = input.value.substring(0, selStart)

    const preprocessed = preprocessText(text)

    text = preprocessed.text
    const fullCopy = preprocessed.fullCopy
    const lastChar = preprocessed.lastChar
    const spacesCopy = preprocessed.spacesCopy

    const words = text.split(" ")
    let lastWordInd = words.length - 1

    // last keyword lookup
    let lastKeyword = -1

    for (i = 0; i < words.length; i++) {
      if (isKeyword(words[i])) {
        lastKeyword = i
      }
    }

    let wordsCnt = lastWordInd - lastKeyword
    const fieldPos = lastKeyword + 1
    const operatorPos = lastKeyword + 2
    const valuePos = lastKeyword + 3

    let keyword
    if (lastKeyword === -1) {
      keyword = words[lastWordInd]
    } else {
      keyword = words[lastKeyword]
    }

    if (wordsCnt > 1) {
      if (words[fieldPos] === "not") {
        words[fieldPos] = words[fieldPos] + "-" + words[operatorPos]
        words.splice(operatorPos, 1)
        lastWordInd--
        wordsCnt--
      }
    }
    if (wordsCnt > 1) {
      currentField = matchField(words[fieldPos])
      if (currentField) {
        currentFieldValue = fields[currentField].value
      } else {
        currentFieldValue = words[fieldPos]
      }
    }

    while (wordsCnt > 2) {
      const newOperator = words[operatorPos] + "-" + words[valuePos]
      if (isOperator(newOperator)) {
        words[operatorPos] = newOperator
        words.splice(valuePos, 1)
        lastWordInd--
        wordsCnt--
      } else break
    }
    if (wordsCnt > 2) {
      currentOperator = words[operatorPos]
    }

    if (wordsCnt === 0) {
      autocompleteKeyword(words[lastWordInd])
    } else if (wordsCnt === 1) {
      if (keyword === "order-by") {
        autocompleteField(words[lastWordInd])
      } else {
        autocompleteField(words[lastWordInd])
        autocompleteNot(words[lastWordInd])
      }
    } else if (wordsCnt === 2) {
      if (keyword === "order-by") {
        autocompleteOrderBy(words[lastWordInd])
      } else {
        autocompleteOperator(words[lastWordInd])
      }
    } else {
      if (keyword === "order-by") {
        render(suggestions)
        return
      }

      if (wordsCnt < 4) {
        autocompleteOperator(currentOperator + "-" + words[lastWordInd])
      }

      if (currentOperator === "not") {
        render(suggestions)
        return
      }

      if (currentOperator.endsWith("in")) {
        indexOfOperator = spacesCopy.lastIndexOf(
          " " + currentOperator.replace(/-/g, " ") + " "
        )
        open = 0
        close = 0
        for (i = indexOfOperator; i < fullCopy.length; i++) {
          if (fullCopy[i] === "(") open++
          if (fullCopy[i] === ")") close++
        }

        if (open === 0) {
          autocompleteOpenArray()
        } else if (open <= close && lastChar !== ")") {
          autocompleteKeyword(words[lastWordInd])
        } else if (open - close === 1) {
          const inQueries = fullCopy.split(/in\s*\(/g)
          const lastInQuery = inQueries[inQueries.length - 1]
          const wordsList = lastInQuery.split(",")
          const isCommaSeparator = fullCopy.trim().slice(-1) === ","
          const isLastCharNotEmpty = fullCopy.slice(-1).trim()
          const isFirstWordNotEmpty = wordsList[0].trim()
          if (
            isCommaSeparator ||
            !!isLastCharNotEmpty ||
            !isFirstWordNotEmpty
          ) {
            const arePreviousWordsChecked = wordsList.every(checkPreviousWords)
            if (arePreviousWordsChecked || !isFirstWordNotEmpty) {
              autocompleteValue(words[lastWordInd])
            }
          } else {
            autocompleteComma()
            autocompleteCloseArray()
          }
        }
      } else if (currentOperator === "changed") {
        const lastWord = words[lastWordInd - 1]
        if (isChangedOperator(lastWord)) {
          if (isTimeOperator(lastWord)) {
            autocompleteValue(words[lastWordInd], "time")
          } else if (lastWord === "by") {
            autocompleteValue(words[lastWordInd], "user")
          } else {
            autocompleteValue(words[lastWordInd])
          }
        } else if (lastWord === "changed") {
          autocompleteChangedKeyword(words[lastWordInd])
          autocompleteKeyword(words[lastWordInd])
        } else {
          let index = lastWordInd
          while (
            index >= 0 &&
            words[index] !== "changed" &&
            !isChangedOperator(words[index])
          ) { index-- }
          const lastChangedOperator = words[index]

          indexOfOperator = spacesCopy.lastIndexOf(
            " " + lastChangedOperator + " "
          )
          open = 0
          close = 0
          for (i = indexOfOperator; i < fullCopy.length; i++) {
            if (fullCopy[i] === "(") open++
            if (fullCopy[i] === ")") close++
          }

          if (close >= open && lastChar !== ")") {
            autocompleteChangedKeyword(words[lastWordInd])
            autocompleteKeyword(words[lastWordInd])
          }
        }
      } else {
        if (wordsCnt === 3) {
          autocompleteValue(words[lastWordInd])
        } else {
          indexOfOperator = spacesCopy.lastIndexOf(
            " " + currentOperator.replace(/-/g, " ") + " "
          )
          open = 0
          close = 0
          for (i = indexOfOperator; i < fullCopy.length; i++) {
            if (fullCopy[i] === "(") open++
            if (fullCopy[i] === ")") close++
          }
          if (close >= open && lastChar !== ")") {
            autocompleteKeyword(words[lastWordInd])
          }
        }
      }
    }

    render(suggestions)
  }

  input.addEventListener("keyup", e => {
    if (e.which === KeyCode.LEFT_ARROW || e.which === KeyCode.RIGHT_ARROW) {
      handleInputChange()
    }
  })

  input.addEventListener("click", handleInputChange)

  input.addEventListener("input", handleInputChange)

  function passAutocompleteData(autocompleteData) {
    fields = autocompleteData.visibleFieldNames

    for (i in fields) {
      fields[i].copy = fields[i].value.toLowerCase().replace(/ /g, "-")
      fields[i].displayNameCopy = fields[i].displayName
        .toLowerCase()
        .replace(/ /g, "-")

      fields[i].operatorsCopy = []
      for (const j in fields[i].operators) { fields[i].operatorsCopy.push(fields[i].operators[j].replace(/ /g, "-")) }

      fields[i].operators.sort(sorter)
      fields[i].operatorsCopy.sort(sorter)
    }

    functions = autocompleteData.visibleFunctionNames
    for (i in functions) {
      functions[i].copy = functions[i].value.toLowerCase().replace(/ /g, "-")
      functions[i].displayNameCopy = functions[i].displayName
        .toLowerCase()
        .replace(/ /g, "-")
    }

    if (input.focus) {
      handleInputChange()
    }
  };

  return { passAutocompleteData, onHintClicked }
}

export default JQLAutocomplete

function checkPreviousWords(word) {
  const trimmedWord = word.trim()
  const isWordInQuotes =
    /^'.*'$/.test(trimmedWord) || /^".*"$/.test(trimmedWord)
  const isWordWithoutSpaces = trimmedWord.split(" ").length === 1
  if (isWordInQuotes || isWordWithoutSpaces) return true
  return false
}

function triggetInputEvent(element) {
  const event = document.createEvent("HTMLEvents")
  event.initEvent("input", true, true)
  element.dispatchEvent(event)
}

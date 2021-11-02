import {
  FC,
  useState,
  createRef,
  useCallback,
  useMemo,
  FormEventHandler,
  KeyboardEventHandler,
  ChangeEventHandler,
  RefObject,
} from "react";
import { motion } from "framer-motion";
import shoetest from "shoetest";
import styles from "./Spelling.module.scss";
import SpellingInput from "@components/SpellingInput";

interface InputData {
  value: string;
  selfRef: RefObject<HTMLInputElement>;
  prevRef: RefObject<HTMLInputElement> | null;
  nextRef: RefObject<HTMLInputElement> | null;
  validity: {
    isCorrect: boolean | null;
    isDetermined: boolean;
    isPreviewed: boolean;
  };
}

interface ParsedAnswer {
  words: {
    word: string;
    chars: string[];
  }[];
}

interface Props {
  data: QuestionData;
  onAnswer: (answeredRight: boolean, data: QuestionData) => void;
}

const Spelling: FC<Props> = ({ data, onAnswer }) => {
  const [orderedInputIds, setOrderedInputIds] = useState<string[]>();
  const { answer, question } = data;

  const getInputId = (word: string, char: string, charIdx: number) => `${word}_${char}_${charIdx}`;

  const generateInputData = useCallback((parsed: ParsedAnswer) => {
    const genRecord: Record<string, InputData> = {};
    // used to build node-like struct to allow for easier focus management
    let prevInputId: string | null = null;
    let orderedIds: string[] = [];
    parsed.words.forEach((wordData) => {
      wordData.chars.forEach((char, charIdx) => {
        const id = getInputId(wordData.word, char, charIdx);
        orderedIds.push(id);
        const inputData: InputData = {
          value: "",
          selfRef: createRef(),
          nextRef: null,
          prevRef: null,
          validity: {
            isCorrect: null,
            isDetermined: false,
            isPreviewed: false,
          },
        };
        genRecord[id] = inputData;
        if (prevInputId != null) {
          const prevInput = genRecord[prevInputId];
          prevInput.nextRef = inputData.selfRef;
          inputData.prevRef = prevInput.selfRef;
        }
        prevInputId = id;
      });
    });
    setOrderedInputIds(orderedIds);
    return genRecord;
  }, []);

  const removeDiacritics = (string: string | undefined): string => {
    return shoetest.simplify(string);
  };

  const parseAnswer = useCallback((input: string) => {
    const output: ParsedAnswer = { words: [] };
    const normalizedInput = removeDiacritics(input);
    const words = normalizedInput.split(" ");
    words.forEach((word) => {
      const chars = word.split("");
      output.words.push({ word, chars });
    });
    return output;
  }, []);

  const parsed = useMemo(() => parseAnswer(answer), [answer, parseAnswer]);
  const generatedInputData = useMemo(() => generateInputData(parsed), [parsed, generateInputData]);
  const [dataRecord, setDataRecord] = useState(generatedInputData);

  const checkAnswer: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const localDataRecord = Object.assign({}, dataRecord);
    parsed.words.forEach((w) => {
      const { word, chars } = w;
      chars.forEach((char, charIdx) => {
        const correspondingInputId = getInputId(word, char, charIdx);
        const inputData = Object.assign({}, getInput(correspondingInputId));
        const value = inputData.value;
        inputData.validity.isCorrect = value === char && inputData.validity.isPreviewed !== true;
        inputData.validity.isDetermined = true;
        if (value.length === 0) {
          inputData.validity.isPreviewed = true;
          inputData.value = char;
        }
        localDataRecord[correspondingInputId] = inputData;
      });
    });
    setDataRecord(localDataRecord);
  };

  const focusNextInput = (inputId: string) => {
    const currentlyFocusedInput = getInput(inputId);
    const nextInput = currentlyFocusedInput.nextRef;
    if (!nextInput) return;
    nextInput.current?.focus();
  };

  const focusPrevInput = (inputId: string) => {
    const currentlyFocusedInput = getInput(inputId);
    const prevInput = currentlyFocusedInput.prevRef;
    if (!prevInput) return;
    prevInput.current?.focus();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const key = e.key;
    const target = e.target as HTMLInputElement;
    const id = target.dataset.id;
    if (id == null) return;
    if (key === "ArrowLeft") {
      focusPrevInput(id);
    }
    if (key === "ArrowRight") {
      focusNextInput(id);
    }
    if (key === "Backspace") {
      if (target.value.length === 0) focusPrevInput(id);
      if (target.value.length > 0) clearInput(id);
      if (e.ctrlKey) clearAll();
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const inputId = e.target.dataset.id;
    if (inputId == null) throw new Error("[onChange] Input doesn't contain id");
    const inputState = getInput(inputId);
    if (inputState == null) throw new Error(`[onChange] Data with supplied id (${inputId}) not found in Record`);
    if (inputState.validity.isDetermined === true) return removeVerdictFromAllInputs();
    const newState = Object.assign({}, inputState);
    let value = e.target.value;
    if (value === "" || /^\w$/.test(value)) {
      newState.value = value;
    }
    updateInput(inputId, newState);
    if (value.length !== 0) focusNextInput(inputId);
  };

  const removeVerdictFromAllInputs = () => {
    if (orderedInputIds == null) return;
    orderedInputIds.forEach((id) => {
      const data = getInput(id);
      if (data.validity.isPreviewed === true) data.value = "";
      data.validity = {
        isCorrect: null,
        isDetermined: false,
        isPreviewed: false,
      };
      updateInput(id, data);
    });
  };

  const updateInput = (inputId: string, data: InputData) => {
    setDataRecord((oldState) => {
      return {
        ...oldState,
        [inputId]: data,
      };
    });
  };

  const clearAll = () => {
    const allInputIds = Object.keys(dataRecord);
    allInputIds.forEach((id) => {
      clearInput(id);
    });
    const firstInput = getFirstInput();
    if (firstInput != null) firstInput.selfRef.current?.focus();
  };

  const getFirstInput = () => {
    if (orderedInputIds == null) return;
    const firstInputId = orderedInputIds[0];
    return getInput(firstInputId);
  };

  const clearInput = (inputId: string) => {
    const inputData = getInput(inputId);
    inputData.value = "";
    updateInput(inputId, inputData);
  };

  const getInput = (id: string) => dataRecord[id];

  return (
    <motion.div
      initial={{ opacity: 0, x: "50%", y: "-50%" }}
      animate={{ opacity: 1, x: "-50%" }}
      exit={{ opacity: 0, x: "-150%" }}
      className={styles.inputContainer}
    >
      <h2>{question}</h2>
      <form onSubmit={checkAnswer}>
        {parsed.words.map((w, wordIdx) => {
          const { word, chars } = w;
          return (
            <span key={`${word}_${wordIdx}`} className={styles.word}>
              {chars.map((char, charIdx) => {
                const id = getInputId(word, char, charIdx);
                const data = getInput(id);
                if (data == null) return;
                const { validity, selfRef, value } = data;
                return (
                  <SpellingInput
                    validity={validity}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    refObject={selfRef}
                    value={value}
                    key={id}
                    id={id}
                  />
                );
              })}
            </span>
          );
        })}
        <button type="submit">Submit</button>
      </form>
      <button onClick={() => onAnswer(true, data)}>Correct</button>
      <button onClick={() => onAnswer(false, data)}>Incorrect</button>
    </motion.div>
  );
};

export default Spelling;

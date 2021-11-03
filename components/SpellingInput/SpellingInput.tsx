import classNames from "classnames";
import { motion } from "framer-motion";
import { KeyboardEventHandler, ChangeEventHandler, RefObject } from "react";
import styles from "./SpellingInput.module.scss";

const SpellingInput: React.FC<{
  value: string;
  validity: {
    isCorrect: boolean | null;
    isDetermined: boolean;
    isPreviewed: boolean;
    isSpecial: boolean;
    expected: string;
  };
  id: string;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
  onChange: ChangeEventHandler<HTMLInputElement>;
  refObject: RefObject<HTMLInputElement>;
}> = ({ value, validity, onChange, onKeyDown, refObject, id }) => {
  const classes = classNames(styles.char, {
    [`${styles["char--correct"]}`]: validity.isCorrect === true,
    [`${styles["char--wrong"]}`]: validity.isCorrect === false && validity.isPreviewed !== true,
    [`${styles["char--preview"]}`]: validity.isPreviewed === true,
    [`${styles["char--special"]}`]: validity.isSpecial === true,
  });
  return (
    <motion.input
      key={id}
      type="text"
      className={classes}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      autoCapitalize="none"
      value={validity.isSpecial ? validity.expected : value}
      tabIndex={validity.isSpecial ? -1 : 0}
      readOnly={validity.isSpecial ? true : false}
      ref={refObject}
      data-id={id}
      onKeyDown={onKeyDown}
      onChange={onChange}
      name={id}
    />
  );
};

export default SpellingInput;

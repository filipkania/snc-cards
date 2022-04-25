import { motion } from "framer-motion";
import { ChangeEventHandler, useEffect, useRef } from "react";
import styles from "./Filter.module.scss";

interface Props {
  value: string;
  onChangeHandler: ChangeEventHandler<HTMLInputElement>;
}

const Filter = ({ value, onChangeHandler }: Props) => {
  const inputRef = useRef<null | HTMLInputElement>(null);
  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes("Mac OS X");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "k") {
        e.preventDefault(); // prevent browser shortcut
        inputRef.current?.focus();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
      className={styles.field}
    >
      <label htmlFor="search">Filter topics</label>
      <div className={styles.input__wrapper}>
        <input
          ref={inputRef}
          id="search"
          type="text"
          placeholder="Search for title"
          value={value}
          onChange={onChangeHandler}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: value.length === 0 ? 1 : 0 }}
          className={styles.keyboard__indicator}
        >
          <div className={styles.key}>{isMac ? "⌘" : "Ctrl"}</div>
          <div className={styles.key}>K</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Filter;

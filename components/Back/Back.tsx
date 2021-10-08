import { MathJax } from "better-react-mathjax";
import classNames from "classnames";
import React from "react";
import styles from "./Back.module.scss";

interface Props {
  data: string;
  isMobile: boolean | undefined;
  dataClass: Data["class"];
}

// function formatData(data: string) {
//   const [present, past, perfect] = data.split(" | ");
//   return (
//     <div className={styles.answer}>
//       <div className={styles.answer__entry}>
//         <p className={styles.answer__label}>Present</p>
//         <p className={styles.answer__text}>{present}</p>
//       </div>
//       <div className={styles.answer__entry}>
//         <p className={styles.answer__label}>Past</p>
//         <p className={styles.answer__text}>{past}</p>
//       </div>
//       <div className={styles.answer__entry}>
//         <p className={styles.answer__label}>Perfect</p>
//         <p className={styles.answer__text}>{perfect}</p>
//       </div>
//     </div>
//   );
// }

function formatData(data: string, dataClass: Data["class"]) {
  if (dataClass === "?MATH") {
    return (
      <div className={styles.answer__text}>
        <MathJax>{String.raw`${data}`}</MathJax>
        {/* <MathJax>{"\\(\\frac{10}{4x} \\approx 2^{12}\\)"}</MathJax> */}
      </div>
    );
  }
  return <div className={styles.answer__text}>{data}</div>;
}

const Back = ({ data, isMobile, dataClass }: Props) => {
  const wrapperClasses = classNames(styles.wrapper, {
    [`${styles["wrapper--mobile"]}`]: isMobile,
  });
  return <div className={wrapperClasses}>{formatData(data, dataClass)}</div>;
};

export default Back;

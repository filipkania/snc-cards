import React, { useEffect, useRef, useState } from "react";
import { getData } from "@data/exporter";
import styles from "@styles/List.module.scss";
import classNames from "classnames";
import getAccentForClass from "@utils/getAccentForClass";
import ArrowRightCircle from "icons/ArrowRightCircle";
interface Props {
  dataObject: Data;
}

export default function CardId({ dataObject }: Props) {
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const [isSticky, setIsSticky] = useState(false);

  const topContainerClasses = classNames(styles["top__container"], {
    [`${styles["top__container--sticky"]}`]: isSticky,
  });

  useEffect(() => {
    const cachedRef = headerRef.current;
    if (cachedRef == null) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(entry.intersectionRatio < 1);
      },
      { threshold: [1] }
    );

    observer.observe(cachedRef);
    return () => {
      observer.unobserve(cachedRef);
    };
  }, []);
  return (
    <>
      <div
        className={styles.container}
        style={{ margin: "2rem auto 0", ["--clr-accent" as any]: getAccentForClass(dataObject.class) }}
      >
        <h1 className={styles.title}>
          List view for <br />
          <span>{dataObject.title}</span>
        </h1>
      </div>
      <div ref={headerRef} className={topContainerClasses}>
        <div className={styles.container}>
          <header className={styles.top}>
            <p>Question</p>
            <p>Answer</p>
          </header>
        </div>
      </div>
      <div className={styles.container} style={{ ["--clr-accent" as any]: getAccentForClass(dataObject.class) }}>
        <div className={styles.list}>
          {dataObject.data.map((d) => {
            return (
              <div className={styles.list__item} key={`${d.question}-${d.answer}`}>
                <div className={styles.question}>{d.question}</div>
                <ArrowRightCircle />
                <div className={styles.answer}>{d.answer}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = (await getData()).map((d) => ({
    params: { id: d.id },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: any) {
  const data = (await getData()).find((d) => d.id === params.id);
  return {
    props: { dataObject: data },
  };
}

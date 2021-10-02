import Viewer from "@components/Viewer";
import React from "react";
import { getData } from "@data/exporter";

interface Props {
  data: any[];
}

export default function CardId({ data }: Props) {
  return <Viewer data={data} />;
}

export async function getStaticPaths() {
  const paths = (await getData()).map((d) => ({
    params: { id: d.id },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: any) {
  const data = (await getData()).find((d) => d.id === params.id)?.data;
  return {
    props: { data: data },
  };
}

"use client";
import dynamic from "next/dynamic";
const ReaderFrame = dynamic(() => import("./ReaderFrame"), { ssr: false, loading: () => <p role="status">Preparando o leitor…</p> });
export function PdfReader(props: { id: string; kind: string; title: string; edition?: string }) { return <ReaderFrame key={props.id} {...props} />; }

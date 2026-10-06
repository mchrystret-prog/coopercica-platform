import { ReaderPage } from "@/components/publications/ReaderPage";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <ReaderPage id={(await params).id} kind="folheto" />; }

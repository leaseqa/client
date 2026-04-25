import PageLoadingState from "@/components/ui/PageLoadingState";

export default function QALoading() {
  return (
    <div className="qa-page">
      <PageLoadingState message="Loading section..."/>
    </div>
  );
}

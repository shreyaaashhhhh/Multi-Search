/** Full-page centered loading indicator */
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20" role="status" aria-label="Loading">
      <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );
}

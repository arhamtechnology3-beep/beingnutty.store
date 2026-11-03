export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] animate-pulse px-5 pb-28 pt-32 md:px-10 md:pt-40" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-40 rounded-full bg-line" />
      <div className="mt-6 h-14 w-3/4 max-w-xl rounded-2xl bg-line" />
      <div className="mt-4 h-5 w-1/2 max-w-md rounded-full bg-line" />
      <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i}>
            <div className="aspect-[4/5] rounded-[2rem] bg-line" />
            <div className="mt-4 h-5 w-2/3 rounded-full bg-line" />
            <div className="mt-2 h-4 w-1/3 rounded-full bg-line" />
          </li>
        ))}
      </ul>
    </div>
  );
}

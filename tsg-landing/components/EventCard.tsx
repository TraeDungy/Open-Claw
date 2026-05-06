export default function EventCard({ title, date, location }: { title: string; date: string; location: string }) {
  return (
    <div className="rounded-xl border border-ember/30 bg-black/60 p-5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold tracking-[0.3em] text-ember">UPCOMING SESSION</p>
      <h3 className="mt-3 text-xl font-bold">{title}</h3>
      <div className="mt-4 space-y-1.5 text-sm text-bone/70">
        <p className="flex items-center gap-2">
          <svg className="h-4 w-4 text-bone/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {date}
        </p>
        <p className="flex items-center gap-2">
          <svg className="h-4 w-4 text-bone/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {location}
        </p>
      </div>
      <a className="mt-5 inline-block rounded-full border border-ember/50 px-5 py-2 text-xs font-semibold tracking-wider text-ember transition hover:bg-ember hover:text-black" href="#">
        VIEW ON EVENTBRITE
      </a>
    </div>
  );
}
